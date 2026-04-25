<?php
require 'vendor/autoload.php';
$api = new \App\Services\RouterosAPI();
if ($api->connect('192.168.56.2', 'admin', '')) {
    $traffic = $api->comm('/interface/monitor-traffic', [ 'interface' => 'ether1', 'once' => '' ]);
    print_r($traffic);
    $api->disconnect();
}
