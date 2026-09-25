// vetta-relay: a Nostr relay that keeps the VETTA public record online.
//
// Write policy (fail closed):
//   - any event signed by the VETTA organisation key (the record, profile, corrections)
//   - kind 1059 gift wraps addressed to the VETTA key (NIP-17 anonymous tips)
//   - kind 9735 zap receipts that tag the VETTA key
//
// Everything else is rejected. Gift wraps are only served back to the VETTA key
// after NIP-42 auth, so tip metadata is never public.
package main

import (
	"context"
	"encoding/hex"
	"fmt"
	"log"
	"net/http"
	"os"
	"slices"
	"strings"
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

func newRelay(vetta, dbPath, serviceURL string) (*khatru.Relay, func(), error) {
	decoded, err := hex.DecodeString(vetta)
	if err != nil || len(decoded) != 32 || vetta != strings.ToLower(vetta) {
		return nil, nil, fmt.Errorf("VETTA_PUBKEY must be 64 lowercase hex characters")
	}
	relay := khatru.NewRelay()
	relay.ServiceURL = serviceURL
	relay.Info.Name = "VETTA record relay"
	relay.Info.Description = "Keeps the VETTA public record of Kenyan cabinet vetting online. Accepts only events signed by the VETTA key, and encrypted tips addressed to it."
	relay.Info.PubKey = vetta
	relay.Info.Software = "https://github.com/fiatjaf/khatru"
	relay.Info.SupportedNIPs = append(relay.Info.SupportedNIPs, 17, 42, 59)

	db := badger.BadgerBackend{Path: dbPath}
	if err := db.Init(); err != nil {
		return nil, nil, err
	}

	relay.StoreEvent = append(relay.StoreEvent, db.SaveEvent)
	relay.DeleteEvent = append(relay.DeleteEvent, db.DeleteEvent)
	relay.ReplaceEvent = append(relay.ReplaceEvent, db.ReplaceEvent)
	relay.CountEvents = append(relay.CountEvents, db.CountEvents)
	// COUNT is an independent path: broad unauthenticated counts would expose tip volume.
	relay.RejectCountFilter = append(relay.RejectCountFilter, func(ctx context.Context, f nostr.Filter) (bool, string) {
		if khatru.GetAuthed(ctx) != vetta && (len(f.Kinds) == 0 || slices.Contains(f.Kinds, kindGiftWrap)) {
			return true, "restricted: public counts require explicit public event kinds"
		}
		return false, ""
	})
	// Live subscriptions bypass QueryEvents, including limit:0 subscriptions.
	relay.PreventBroadcast = append(relay.PreventBroadcast, func(ws *khatru.WebSocket, ev *nostr.Event) bool {
		return ev.Kind == kindGiftWrap && ws.AuthedPublicKey != vetta
	})

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
				select {
				case out <- ev:
				case <-ctx.Done():
					// Drain the backend producer so canceled subscriptions do not strand it.
					for range ch {
					}
					return
				}
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
			case ev.Kind == kindGiftWrap:
				if !tagsPubkey(ev, vetta) || len(ev.Content) > 64_000 {
					return true, "invalid: tips must address VETTA and be at most 64000 bytes"
				}
				return false, ""
			case ev.PubKey == vetta:
				return false, ""
			case ev.Kind == kindZapReceipt && tagsPubkey(ev, vetta):
				return false, ""
			}
			return true, "restricted: this relay only stores the VETTA record and tips addressed to it"
		},
	)

	mux := relay.Router()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) { w.Write([]byte("ok\n")) })

	return relay, func() { db.Close() }, nil
}

func main() {
	addr := env("LISTEN", "127.0.0.1:7447")
	dbPath := env("DB_PATH", os.Getenv("HOME")+"/.local/share/vetta-relay/db")
	relay, closeDB, err := newRelay(env("VETTA_PUBKEY", ""), dbPath, env("SERVICE_URL", "wss://vetta-relay.agent9.dev"))
	if err != nil {
		log.Fatal(err)
	}
	defer closeDB()
	log.Printf("vetta-relay listening on %s", addr)
	server := &http.Server{Addr: addr, Handler: relay, ReadHeaderTimeout: 10 * time.Second}
	log.Fatal(server.ListenAndServe())
}
