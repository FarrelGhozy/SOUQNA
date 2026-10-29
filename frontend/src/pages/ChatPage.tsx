import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import { formatDateWIB } from '../lib/format.js';
import type { Conversation, Message, Store } from '../types/index.js';

// Chat teks per toko. Pesan >7 hari disembunyikan (simulasi purge),
// thread tetap ada + penghitung pesan lama.
export function ChatPage() {
  const [params, setParams] = useSearchParams();
  const [threads, setThreads] = useState<Conversation[]>([]);
  const [stores, setStores] = useState<Record<string, Store>>({});
  const [active, setActive] = useState<string | null>(params.get('thread'));
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [hidden, setHidden] = useState(0);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadThreads = async () => {
    const t = await api.getConversations();
    setThreads(t);
    const map: Record<string, Store> = {};
    for (const c of t) {
      const s = await api.getStore(c.store_id);
      if (s) map[c.store_id] = s;
    }
    setStores(map);
    return t;
  };

  const loadMsgs = async (id: string) => {
    const r = await api.getMessages(id);
    setMsgs(r.messages);
    setHidden(r.hidden);
  };

  useEffect(() => {
    (async () => {
      try {
        const t = await loadThreads();
        const sel = params.get('thread') ?? t[0]?.id ?? null;
        setActive(sel);
        if (sel) await loadMsgs(sel);
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Gagal memuat chat.');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pick = async (id: string) => {
    setActive(id);
    setParams({ thread: id });
    await loadMsgs(id);
  };

  if (loading) return <p>Memuat chat...</p>;
  if (err) return <p style={{ color: 'red' }}>{err}</p>;

  return (
    <>
      <h1>Chat</h1>
      {threads.length === 0 ? <p>Belum ada thread. Mulai dari halaman toko/produk.</p> : (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 220 }}>
            <h3>Thread</h3>
            {threads.map((t) => (
              <div key={t.id} style={{ marginBottom: 4 }}>
                <button
                  style={{ fontWeight: t.id === active ? 800 : 400 }}
                  onClick={() => pick(t.id)}
                >
                  {stores[t.store_id]?.name ?? t.store_id}
                </button>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: 260 }}>
            {!active ? <p>Pilih thread.</p> : (
              <>
                {hidden > 0 && <p><small>{hidden} pesan lama (&gt;7 hari) disembunyikan otomatis — thread tetap ada.</small></p>}
                {msgs.length === 0
                  ? <p><small>Belum ada pesan terlihat. {hidden > 0 ? 'Riwayat hanya berisi pesan lama.' : 'Kirim pesan pertama.'}</small></p>
                  : msgs.map((m) => (
                    <div key={m.id} style={{ borderBottom: '1px solid #eee', padding: 4 }}>
                      <small>{formatDateWIB(m.created_at)} WIB</small> — {m.body}
                    </div>
                  ))}
                <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                  <input
                    style={{ flex: 1 }} value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Tulis pesan (maks 2000 char)"
                    maxLength={2000}
                  />
                  <button disabled={busy || !draft.trim()} onClick={async () => {
                    setBusy(true);
                    try {
                      await api.sendMessage(active, draft);
                      setDraft('');
                      await loadMsgs(active);
                    } catch (e) {
                      alert(e instanceof Error ? e.message : 'Gagal kirim.');
                    } finally {
                      setBusy(false);
                    }
                  }}>Kirim</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <p><Link to="/search">← Kembali belanja</Link></p>
    </>
  );
}
