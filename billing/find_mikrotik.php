<?php for($i=2; $i<=254; $i++){ $ip="192.168.18.$i"; $conn=@fsockopen($ip, 8728, $err, $str, 0.2); if($conn){ echo "Found Mikrotik at: $ip\n"; fclose($conn); break; } }
