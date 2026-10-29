import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api-client.js';
import { formatDateWIB } from '../lib/format.js';
import type { Conversation, Message, Store } from '../types/index.js';
import { Button } from '../components/ui/Button.js';
import { Alert } from '../components/ui/Alert.js';
import { EmptyState } from '../components/ui/EmptyState.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { useToast } from '../components/ui/ToastContext.js';

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
  const msgEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

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
    try {
      const r = await api.getMessages(id);
      setMsgs(r.messages);
      setHidden(r.hidden);
    } catch (e) {
      toast.error('Gagal memuat pesan obrolan.');
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const t = await loadThreads();
        const sel = params.get('thread') ?? t[0]?.id ?? null;
        setActive(sel);
        if (sel) await loadMsgs(sel);
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Gagal memuat obrolan.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const pick = async (id: string) => {
    setActive(id);
    setParams({ thread: id });
    await loadMsgs(id);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!active || !draft.trim()) return;
    setBusy(true);
    try {
      await api.sendMessage(active, draft.trim());
      setDraft('');
      await loadMsgs(active);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gagal mengirim pesan.');
    } finally {
      setBusy(false);
    }
  };

  const activeStore = active ? stores[threads.find((t) => t.id === active)?.store_id ?? ''] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Header */}
      <div>
        <nav aria-label="Breadcrumb" style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: 8, marginBottom: 'var(--space-2)' }}>
          <Link to="/">Beranda</Link>
          <span>/</span>
          <span style={{ color: 'var(--unida-text)', fontWeight: 600 }}>Pesan & Chat</span>
        </nav>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Obrolan Langsung (Chat Toko)</h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: 4 }}>
          Hubungi merchant kampus untuk bertanya stok, varian, atau jadwal serah terima COD
        </p>
      </div>

      {err && <Alert variant="danger">{err}</Alert>}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 'var(--space-4)', minHeight: 480 }}>
          <Skeleton height={480} borderRadius="var(--radius-lg)" />
          <Skeleton height={480} borderRadius="var(--radius-lg)" />
        </div>
      ) : threads.length === 0 ? (
        <EmptyState
          title="Belum Ada Percakapan"
          description="Anda belum memiliki obrolan dengan toko manapun. Kunjungi halaman produk atau toko lalu klik tombol 'Chat Toko' untuk memulai obrolan."
          actionLabel="Jelajahi Produk"
          onAction={() => window.location.assign('/search')}
        />
      ) : (
        <div
          className="card"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(220px, 280px) 1fr',
            minHeight: 520,
            overflow: 'hidden',
          }}
        >
          {/* Threads Sidebar */}
          <div
            style={{
              borderRight: '1px solid var(--border)',
              background: 'var(--surface-muted)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border)' }}>
              <strong style={{ fontSize: '14px', color: 'var(--unida-navy)' }}>
                Daftar Percakapan ({threads.length})
              </strong>
            </div>

            <div style={{ overflowY: 'auto', flex: 1 }}>
              {threads.map((t) => {
                const s = stores[t.store_id];
                const isSelected = t.id === active;
                return (
                  <button
                    key={t.id}
                    onClick={() => pick(t.id)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      border: 'none',
                      borderBottom: '1px solid var(--border)',
                      background: isSelected ? 'var(--surface)' : 'transparent',
                      borderLeft: isSelected ? '4px solid var(--unida-gold)' : '4px solid transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background var(--transition-fast)',
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        background: 'var(--unida-navy)',
                        color: 'var(--unida-gold)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '14px',
                        flexShrink: 0,
                      }}
                    >
                      {s?.name?.charAt(0) || '🏬'}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontWeight: isSelected ? 700 : 600,
                          color: 'var(--unida-navy)',
                          fontSize: '14px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {s?.name || t.store_id}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: 2 }}>
                        {formatDateWIB(t.created_at)} WIB
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Chat Conversation Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--surface)' }}>
            {/* Thread Header */}
            <div
              style={{
                padding: 'var(--space-3) var(--space-4)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--surface)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '20px' }}>💬</span>
                <div>
                  <strong style={{ fontSize: '15px', color: 'var(--unida-navy)' }}>
                    {activeStore ? activeStore.name : 'Percakapan'}
                  </strong>
                  {activeStore && (
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      Pickup: {activeStore.pickup_location}
                    </div>
                  )}
                </div>
              </div>

              {activeStore && (
                <Link to={`/stores/${activeStore.id}`}>
                  <Button variant="ghost" size="sm">
                    Kunjungi Toko →
                  </Button>
                </Link>
              )}
            </div>

            {/* 7-Day Purge Policy Alert */}
            <div
              style={{
                background: 'var(--gold-soft)',
                borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
                padding: '8px 16px',
                fontSize: '12px',
                color: 'var(--unida-navy)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>⏱️</span>
              <span>
                <strong>Kebijakan Privasi:</strong> Pesan obrolan berumur &gt;7 hari otomatis dibersihkan secara berkala.
                {hidden > 0 && ` (${hidden} pesan terdahulu telah diarsipkan).`}
              </span>
            </div>

            {/* Messages Body */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: 'var(--space-4)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                maxHeight: 380,
                background: 'var(--surface-muted)',
              }}
            >
              {msgs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--muted)', fontSize: '14px' }}>
                  Belum ada pesan. Mulai obrolan dengan mengirim pesan pertama!
                </div>
              ) : (
                msgs.map((m) => {
                  const isStoreSender = m.sender_id.includes('merchant');
                  return (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isStoreSender ? 'flex-start' : 'flex-end',
                      }}
                    >
                      <div
                        style={{
                          maxWidth: '75%',
                          padding: '10px 14px',
                          borderRadius: isStoreSender ? '12px 12px 12px 2px' : '12px 12px 2px 12px',
                          background: isStoreSender ? 'var(--surface)' : 'var(--unida-navy)',
                          color: isStoreSender ? 'var(--unida-text)' : 'var(--surface)',
                          border: isStoreSender ? '1px solid var(--border)' : 'none',
                          boxShadow: 'var(--shadow-sm)',
                          fontSize: '14px',
                          lineHeight: 1.45,
                        }}
                      >
                        {m.body}
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--muted)', marginTop: 4, padding: '0 4px' }}>
                        {formatDateWIB(m.created_at)} WIB
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={msgEndRef} />
            </div>

            {/* Message Input Footer */}
            <form
              onSubmit={handleSend}
              style={{
                padding: 'var(--space-3) var(--space-4)',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--surface)',
              }}
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ketik pesan untuk penjual (maks. 2000 karakter)..."
                maxLength={2000}
                className="form-input"
                style={{ flex: 1, minHeight: 40 }}
              />
              <span style={{ fontSize: '11px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                {draft.length}/2000
              </span>
              <Button type="submit" variant="primary" size="md" disabled={busy || !draft.trim()} loading={busy}>
                Kirim
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
