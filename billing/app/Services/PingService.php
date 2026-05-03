<?php

namespace App\Services;

class PingService
{
    /**
     * Ping a host to check if it's reachable.
     * 
     * @param string $host
     * @return bool
     */
    public function ping(string $host): bool
    {
        // Simple PHP ping implementation using exec
        // In windows, ping -n 1
        // In linux, ping -c 1
        $os = strtoupper(substr(PHP_OS, 0, 3));
        if ($os === 'WIN') {
            exec(sprintf('ping -n 1 -w 1000 %s', escapeshellarg($host)), $res, $rval);
        } else {
            exec(sprintf('ping -c 1 -W 1 %s', escapeshellarg($host)), $res, $rval);
        }

        return $rval === 0;
    }
}
