import type { Tables, TablesInsert, TablesUpdate } from './supabase'

export type Order = Tables<'orders'>
export type OrderInsert = TablesInsert<'orders'>
export type OrderUpdate = TablesUpdate<'orders'>
export type SmsLog = Tables<'sms_log'>
export type SmsLogInsert = TablesInsert<'sms_log'>

export type OrderStatus = 'prijata' | 'vyroba' | 'hotovo' | 'vyzdvihnuta'
export type OrderType = 'velkformat' | 'plocha' | 'textil' | 'darcek' | 'gravir' | 'peciatky' | 'tabulky'
export type OrderZone = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'
export type PaymentType = 'zaplatene' | 'zaloha' | 'treba-zaplatit'
