<?php namespace App\Services\WhatsApp; interface WhatsAppProviderInterface { 
    public function sendMessage(string $phone, string $message): bool; 
    public function sendBatch(array $messages, ?string $delay = '2-5'): array;
    public function reschedule(int $messageId, int $newSchedule, ?string $delay = null): array;
}
