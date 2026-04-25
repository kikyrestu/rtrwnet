<?php namespace App\Services\WhatsApp; interface WhatsAppProviderInterface { public function sendMessage(string $phone, string $message): bool; }
