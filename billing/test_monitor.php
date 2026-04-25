<?php
require 'vendor/autoload.php';
$api = new \App\Services\RouterosAPI();
if ($api->connect('192.168.56.2', 'admin', '')) {
    $api->write('/interface/monitor-traffic', false);
    $api->write('=interface=ether1', false);
    $api->write('=once=', true);
    $READ = $api->read(false);
    $ARRAY = $api->parseResponse($READ);
    print_r($ARRAY);
    $api->disconnect();
}
