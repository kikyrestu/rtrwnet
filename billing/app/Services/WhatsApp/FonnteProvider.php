<?php namespace App\Services\WhatsApp; 
use Illuminate\Support\Facades\Http; 
use Illuminate\Support\Facades\Log; 

class FonnteProvider implements WhatsAppProviderInterface { 
    protected $token; 
    
    public function __construct(string $token = '') { 
        $this->token = $token ?: env("WA_FONNTE_TOKEN"); 
    } 
    
    public function sendMessage(string $phone, string $message): bool { 
        try { 
            $response = Http::withHeaders(["Authorization" => $this->token])->post("https://api.fonnte.com/send", ["target" => $phone, "message" => $message]); 
            return $response->successful(); 
        } catch (\Exception $e) { 
            Log::error("Fonnte API Err: " . $e->getMessage()); 
            return false; 
        } 
    } 
    
    public function sendBatch(array $messages, ?string $delay = '2-5'): array {
        try {
            $payload = [
                'data' => json_encode($messages),
            ];
            if ($delay) {
                $payload['delay'] = $delay;
            }
            
            $response = Http::withHeaders(["Authorization" => $this->token])->post("https://api.fonnte.com/send", $payload);
            
            if ($response->successful()) {
                return $response->json();
            }
            return ['status' => false, 'reason' => 'HTTP Error: ' . $response->status()];
        } catch (\Exception $e) {
            Log::error("Fonnte Batch Err: " . $e->getMessage());
            return ['status' => false, 'reason' => $e->getMessage()];
        }
    }
    
    public function reschedule(int $messageId, int $newSchedule, ?string $delay = null): array {
        try {
            $payload = [
                'id' => $messageId,
                'schedule' => $newSchedule
            ];
            if ($delay) {
                $payload['delay'] = $delay;
            }
            
            $response = Http::withHeaders(["Authorization" => $this->token])->post("https://api.fonnte.com/reset-message", $payload);
            
            if ($response->successful()) {
                return $response->json();
            }
            return ['status' => false, 'reason' => 'HTTP Error: ' . $response->status()];
        } catch (\Exception $e) {
            Log::error("Fonnte Reschedule Err: " . $e->getMessage());
            return ['status' => false, 'reason' => $e->getMessage()];
        }
    }
}
