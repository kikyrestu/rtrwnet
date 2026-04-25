<?php
require 'routeros_api.class.php';
$API = new RouterosAPI();
$API->debug = true;
if ($API->connect('10.147.146.150', 'admin', 'Kikyrestu089')) {
    $res = $API->comm('/ppp/profile/add', [
        'name' => 'test-profile-123',
        'rate-limit' => '1M/1M'
    ]);
    print_r($res);
    $API->disconnect();
} else {
    echo "Konek gagal";
}
