<?php namespace App\Services\WhatsApp; use Illuminate\Support\Facades\Log; class LogProvider implements WhatsAppProviderInterface  { public function sendMessage(string $phone, string $message): bool { Log::info("WA_LOG_MOCK -> To: {$phone} | Message: {$message}"); return true; } 
public function sendBatch(array $messages, ?string $delay = '2-5'): array { Log::info("WA_LOG_BATCH_MOCK -> " . json_encode($messages)); return ['status' => true, 'detail' => 'Mock success', 'id' => [rand(1000, 9999)]]; }
public function reschedule(int $messageId, int $newSchedule, ?string $delay = null): array { Log::info("WA_LOG_RESCHEDULE_MOCK -> ID: {$messageId} to {$newSchedule}"); return ['status' => true, 'detail' => 'Mock rescheduled']; }
}
