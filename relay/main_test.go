package main

import (
	"encoding/json"
	"github.com/fasthttp/websocket"
	"github.com/nbd-wtf/go-nostr"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func signed(t *testing.T, key string, kind int, tags nostr.Tags, content string, when nostr.Timestamp) nostr.Event {
	t.Helper()
	e := nostr.Event{Kind: kind, Tags: tags, Content: content, CreatedAt: when}
	if err := e.Sign(key); err != nil {
		t.Fatal(err)
	}
	return e
}
func connect(t *testing.T, url string) *websocket.Conn {
	t.Helper()
	c, _, err := websocket.DefaultDialer.Dial(url, nil)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { c.Close() })
	return c
}
func send(t *testing.T, c *websocket.Conn, v any) {
	t.Helper()
	if err := c.WriteJSON(v); err != nil {
		t.Fatal(err)
	}
}
func read(t *testing.T, c *websocket.Conn) []json.RawMessage {
	t.Helper()
	c.SetReadDeadline(time.Now().Add(3 * time.Second))
	var m []json.RawMessage
	if err := c.ReadJSON(&m); err != nil {
		t.Fatal(err)
	}
	return m
}
func label(m []json.RawMessage) string { var s string; json.Unmarshal(m[0], &s); return s }
func publish(t *testing.T, c *websocket.Conn, e nostr.Event, want bool) {
	t.Helper()
	send(t, c, []any{"EVENT", e})
	m := read(t, c)
	if label(m) != "OK" {
		t.Fatalf("expected OK got %s", m)
	}
	var ok bool
	json.Unmarshal(m[2], &ok)
	if ok != want {
		t.Fatalf("publication got %v want %v: %s", ok, want, m)
	}
}
func query(t *testing.T, c *websocket.Conn, f any) []nostr.Event {
	t.Helper()
	send(t, c, []any{"REQ", "q", f})
	out := []nostr.Event{}
	for {
		m := read(t, c)
		switch label(m) {
		case "EVENT":
			var e nostr.Event
			json.Unmarshal(m[2], &e)
			out = append(out, e)
		case "EOSE":
			send(t, c, []any{"CLOSE", "q"})
			return out
		case "CLOSED":
			t.Fatalf("query closed %s", m)
		}
	}
}
func TestRelayPrivacyAndRecordIntegrity(t *testing.T) {
	key := nostr.GeneratePrivateKey()
	pk, _ := nostr.GetPublicKey(key)
	other := nostr.GeneratePrivateKey()
	relay, closeDB, err := newRelay(pk, t.TempDir()+"/db", "")
	if err != nil {
		t.Fatal(err)
	}
	defer closeDB()
	server := httptest.NewServer(relay)
	defer server.Close()
	url := "ws" + strings.TrimPrefix(server.URL, "http")
	writer := connect(t, url)
	public := connect(t, url)
	reviewer := connect(t, url)
	now := nostr.Now()
	t.Run("reject unauthorized author", func(t *testing.T) { publish(t, writer, signed(t, other, 1, nostr.Tags{}, "unauthorized", now), false) })
	t.Run("reject forged signature", func(t *testing.T) {
		e := signed(t, key, 1, nostr.Tags{}, "forged", now)
		e.Sig = strings.Repeat("0", 128)
		publish(t, writer, e, false)
	})
	t.Run("replace records", func(t *testing.T) {
		a := signed(t, key, 30023, nostr.Tags{{"d", "record"}}, "old", now-2)
		b := signed(t, key, 30023, a.Tags, "new", now-1)
		publish(t, writer, a, true)
		publish(t, writer, b, true)
		got := query(t, public, nostr.Filter{Kinds: []int{30023}})
		if len(got) != 1 || got[0].ID != b.ID {
			t.Fatalf("replacement failed %+v", got)
		}
	})
	t.Run("reject misaddressed tip", func(t *testing.T) {
		publish(t, writer, signed(t, other, 1059, nostr.Tags{}, "not addressed", now), false)
	})
	tip := signed(t, other, 1059, nostr.Tags{{"p", pk}}, "synthetic encrypted payload", now)
	t.Run("anonymous tips hidden live and stored", func(t *testing.T) {
		send(t, public, []any{"REQ", "live", map[string]any{"limit": 0}})
		if label(read(t, public)) != "EOSE" {
			t.Fatal("no live EOSE")
		}
		publish(t, writer, tip, true)
		sentinel := signed(t, key, 1, nostr.Tags{}, "public sentinel", now)
		publish(t, writer, sentinel, true)
		m := read(t, public)
		var e nostr.Event
		json.Unmarshal(m[2], &e)
		if label(m) != "EVENT" || e.ID != sentinel.ID {
			t.Fatalf("tip leaked live %s", m)
		}
		send(t, public, []any{"CLOSE", "live"})
		for _, e := range query(t, public, nostr.Filter{}) {
			if e.Kind == 1059 {
				t.Fatal("stored tip leaked")
			}
		}
	})
	t.Run("counts do not leak tips", func(t *testing.T) {
		for _, f := range []nostr.Filter{{}, {Kinds: []int{1059}}, {IDs: []string{tip.ID}}} {
			send(t, public, []any{"COUNT", "c", f})
			for {
				m := read(t, public)
				if label(m) == "COUNT" {
					var result struct{ Count int }
					json.Unmarshal(m[2], &result)
					if result.Count != 0 {
						t.Fatal("count leaked tip")
					}
					break
				}
			}
		}
		send(t, public, []any{"COUNT", "c", nostr.Filter{Kinds: []int{30023}}})
		m := read(t, public)
		var result struct{ Count int }
		json.Unmarshal(m[2], &result)
		if result.Count != 1 {
			t.Fatalf("public count %s", m)
		}
	})
	t.Run("authenticated reviewer reads tips", func(t *testing.T) {
		send(t, reviewer, []any{"REQ", "private", nostr.Filter{Kinds: []int{1059}}})
		challenge := ""
		closed := false
		for challenge == "" || !closed {
			m := read(t, reviewer)
			if label(m) == "AUTH" {
				json.Unmarshal(m[1], &challenge)
			}
			if label(m) == "CLOSED" {
				closed = true
			}
		}
		auth := signed(t, key, 22242, nostr.Tags{{"relay", url}, {"challenge", challenge}}, "", nostr.Now())
		send(t, reviewer, []any{"AUTH", auth})
		for {
			m := read(t, reviewer)
			if label(m) == "OK" {
				var ok bool
				json.Unmarshal(m[2], &ok)
				if !ok {
					t.Fatalf("auth failed %s", m)
				}
				break
			}
		}
		send(t, reviewer, []any{"COUNT", "private-count", nostr.Filter{Kinds: []int{1059}}})
		m := read(t, reviewer)
		var result struct{ Count int }
		json.Unmarshal(m[2], &result)
		if label(m) != "COUNT" || result.Count != 1 {
			t.Fatalf("reviewer count failed: %s", m)
		}
		got := query(t, reviewer, nostr.Filter{Kinds: []int{1059}})
		if len(got) != 1 || got[0].ID != tip.ID {
			t.Fatal("reviewer retrieval failed")
		}
	})
}
func TestInvalidPublisherKey(t *testing.T) {
	if _, _, err := newRelay(strings.Repeat("z", 64), t.TempDir(), ""); err == nil {
		t.Fatal("nonhex key accepted")
	}
}
