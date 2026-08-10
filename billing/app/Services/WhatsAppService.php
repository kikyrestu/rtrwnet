<?php 

namespace App\Services; 

use App\Services\WhatsApp\WhatsAppProviderInterface; 
use App\Services\WhatsApp\LogProvider; 
use App\Services\WhatsApp\FonnteProvider; 
use App\Services\WhatsApp\RuangWaProvider; 
use App\Models\ModuleConfig;

class WhatsAppService 
{ 
    public static function make(): WhatsAppProviderInterface 
    { 
        $config = ModuleConfig::getForModule('whatsapp', [
            'provider' => 'log',
            'fonnte_token' => '',
            'ruangwa_token' => ''
        ]);
        
        $provider = $config['provider'] ?? 'log'; 
        
        switch (strtolower($provider)) { 
            case "fonnte": 
                return new FonnteProvider($config['fonnte_token'] ?? ''); 
            case "ruangwa": 
                return new RuangWaProvider($config['ruangwa_token'] ?? ''); 
            case "log": 
            default: 
                return new LogProvider(); 
        } 
    } 

    public static function send(string $phone, string $message): bool 
    { 
        return self::make()->sendMessage($phone, $message); 
    } 

    public static function sendBatch(array $messages, ?string $delay = '2-5'): array 
    { 
        return self::make()->sendBatch($messages, $delay); 
    }

    public static function reschedule(int $messageId, int $newSchedule, ?string $delay = null): array 
    { 
        return self::make()->reschedule($messageId, $newSchedule, $delay); 
    }
}
