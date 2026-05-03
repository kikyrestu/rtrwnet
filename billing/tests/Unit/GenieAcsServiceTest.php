<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\GenieAcsService;

class GenieAcsServiceTest extends TestCase
{
    public function test_get_device_status_returns_expected_structure(): void
    {
        $service = new GenieAcsService();
        
        $result = $service->getDeviceStatus('ZTE-12345');

        $this->assertIsArray($result);
        $this->assertTrue($result['success']);
        $this->assertEquals('ZTE-12345', $result['sn']);
        $this->assertArrayHasKey('optical_rx', $result);
        $this->assertArrayHasKey('uptime', $result);
    }

    public function test_reboot_device_returns_success(): void
    {
        $service = new GenieAcsService();
        $result = $service->rebootDevice('ZTE-12345');

        $this->assertTrue($result['success']);
        $this->assertEquals('Perintah reboot berhasil dikirim ke perangkat.', $result['message']);
    }
}
