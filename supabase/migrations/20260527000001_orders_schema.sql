-- Epic 2.1: orders table
CREATE TABLE IF NOT EXISTS orders (
  id              text primary key,
  name            text not null,
  phone           text,
  email           text,
  type            text not null,   -- velkformat | plocha | textil | darcek | gravir | peciatky | tabulky
  zone            text not null,   -- A–G (derived from type)
  shelf           text,            -- e.g. "A-01"
  status          text not null default 'prijata',  -- prijata | vyroba | hotovo | vyzdvihnuta
  payment         text,            -- zaplatene | zaloha | treba-zaplatit
  payment_amount  numeric,
  note            text,
  trello_id       text,
  sms_sent        boolean default false,
  source          text,            -- '' | 'email' | 'import'
  created_at      timestamptz default now()
);

-- Partial unique index: trello_id must be unique when set, but many rows can have NULL
CREATE UNIQUE INDEX IF NOT EXISTS orders_trello_id_unique
  ON orders (trello_id)
  WHERE trello_id IS NOT NULL;

-- Epic 2.2: counter table backing the atomic ID function
CREATE TABLE IF NOT EXISTS order_id_counters (
  date_key  text primary key,
  last_num  integer not null default 0
);

-- Epic 2.2: order_id_seq — returns next ID in YYMMDD-NNN format (e.g. "260527-001")
-- SECURITY DEFINER so the function can write to order_id_counters even when
-- direct client access to that table is blocked by RLS.
CREATE OR REPLACE FUNCTION order_id_seq()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today    text;
  next_num integer;
BEGIN
  today := to_char(now(), 'YYMMDD');

  INSERT INTO order_id_counters (date_key, last_num)
  VALUES (today, 1)
  ON CONFLICT (date_key) DO UPDATE
    SET last_num = order_id_counters.last_num + 1
  RETURNING last_num INTO next_num;

  RETURN today || '-' || LPAD(next_num::text, 3, '0');
END;
$$;

-- Epic 2.5: sms_log — server-side dedup for automatic SMS sends
-- Automatic send: check for existing row with manual = false before sending
-- Manual send: always insert (client enforces 60s cooldown on top)
CREATE TABLE IF NOT EXISTS sms_log (
  id        bigserial primary key,
  order_id  text not null references orders(id),
  phone     text,
  message   text,
  sent_at   timestamptz not null default now(),
  manual    boolean not null default false
);

CREATE INDEX IF NOT EXISTS sms_log_order_id_idx ON sms_log (order_id);

-- ── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_id_counters ENABLE ROW LEVEL SECURITY;

-- Epic 2.4: orders — authenticated users can read, insert, update; no delete
CREATE POLICY "auth_select_orders"
  ON orders FOR SELECT TO authenticated USING (true);

CREATE POLICY "auth_insert_orders"
  ON orders FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "auth_update_orders"
  ON orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Epic 2.4: sms_log — authenticated users can read and insert; no update/delete
CREATE POLICY "auth_select_sms_log"
  ON sms_log FOR SELECT TO authenticated USING (true);

CREATE POLICY "auth_insert_sms_log"
  ON sms_log FOR INSERT TO authenticated WITH CHECK (true);

-- order_id_counters is managed only via order_id_seq() above; no direct access
CREATE POLICY "deny_direct_counters"
  ON order_id_counters FOR ALL TO authenticated USING (false);
