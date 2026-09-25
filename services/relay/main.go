// vetta-relay: a Nostr relay that keeps the VETTA public record online.
//
// Write policy (fail closed):
//   - any event signed by the VETTA organisation key (the record, profile, corrections)
//   - kind 1059 gift wraps addressed to the VETTA key (NIP-17 anonymous tips)
//   - kind 9735 zap receipts that tag the VETTA key
// Everything else is rejected. Gift wraps are only served back to the VETTA key
// after NIP-42 auth, so tip metadata is never public.
package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"slices"
	"time"

	"github.com/fiatjaf/eventstore/badger"
	"github.com/fiatjaf/khatru"
	"github.com/fiatjaf/khatru/policies"
	"github.com/nbd-wtf/go-nostr"
)

const (
	kindGiftWrap   = 1059
	kindZapReceipt = 9735
)

func env(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}

func tagsPubkey(ev *nostr.Event, pk string) bool {
	for _, t := range ev.Tags {
		if len(t) >= 2 && t[0] == "p" && t[1] == pk {
			return true
		}
	}
	return false
}

func main() {
	vetta := env("VETTA_PUBKEY", "")
	if len(vetta) != 64 {
		log.Fatal("VETTA_PUBKEY (64-char hex) is required")
	}
	addr := env("LISTEN", "127.0.0.1:7447")
	dbPath := env("DB_PATH", os.Getenv("HOME")+"/.local/share/vetta-relay/db")

	relay := khatru.NewRelay()
	relay.ServiceURL = env("SERVICE_URL", "wss://vetta-relay.agent9.dev")
	relay.Info.Name = "VETTA record relay"
	relay.Info.Description = "Keeps the VETTA public record of Kenyan cabinet vetting online. Accepts only events signed by the VETTA key, and encrypted tips addressed to it."
	relay.Info.PubKey = vetta
	relay.Info.Software = "https://github.com/fiatjaf/khatru"
	relay.Info.SupportedNIPs = append(relay.Info.SupportedNIPs, 17, 42, 59)

	db := badger.BadgerBackend{Path: dbPath}
	if err := db.Init(); err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	relay.StoreEvent = append(relay.StoreEvent, db.SaveEvent)
	relay.DeleteEvent = append(relay.DeleteEvent, db.DeleteEvent)
	relay.ReplaceEvent = append(relay.ReplaceEvent, db.ReplaceEvent)
	relay.CountEvents = append(relay.CountEvents, db.CountEvents)

	// Hide gift wraps from everyone except the authenticated VETTA key.
	relay.QueryEvents = append(relay.QueryEvents, func(ctx context.Context, f nostr.Filter) (chan *nostr.Event, error) {
		ch, err := db.QueryEvents(ctx, f)
		if err != nil {
			return nil, err
		}
		authed := khatru.GetAuthed(ctx) == vetta
		out := make(chan *nostr.Event)
		go func() {
			defer close(out)
			for ev := range ch {
				if ev.Kind == kindGiftWrap && !authed {
					continue
				}
				out <- ev
			}
		}()
		return out, nil
	})
	relay.RejectFilter = append(relay.RejectFilter,
		policies.FilterIPRateLimiter(20, time.Minute, 60),
		func(ctx context.Context, f nostr.Filter) (bool, string) {
			if slices.Contains(f.Kinds, kindGiftWrap) && khatru.GetAuthed(ctx) != vetta {
				khatru.RequestAuth(ctx)
				return true, "auth-required: tips are readable only by VETTA reviewers"
			}
			return false, ""
		},
	)

	relay.RejectConnection = append(relay.RejectConnection, policies.ConnectionRateLimiter(10, time.Minute, 30))
	relay.RejectEvent = append(relay.RejectEvent,
		policies.EventIPRateLimiter(10, time.Minute, 30),
		policies.PreventTimestampsInTheFuture(30*time.Minute),
		policies.PreventLargeTags(512),
		policies.RejectEventsWithBase64Media,
		func(ctx context.Context, ev *nostr.Event) (bool, string) {
			if len(ev.Content) > 200_000 {
				return true, "invalid: event too large"
			}
			switch {
			case ev.PubKey == vetta:
				return false, ""
			case ev.Kind == kindGiftWrap && tagsPubkey(ev, vetta):
				if len(ev.Content) > 64_000 {
					return true, "invalid: tip too large"
				}
				return false, ""
			case ev.Kind == kindZapReceipt && tagsPubkey(ev, vetta):
				return false, ""
			}
			return true, "restricted: this relay only stores the VETTA record and tips addressed to it"
		},
	)

	mux := relay.Router()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) { w.Write([]byte("ok\n")) })

	log.Printf("vetta-relay listening on %s, db %s", addr, dbPath)
	log.Fatal(http.ListenAndServe(addr, relay))
}
