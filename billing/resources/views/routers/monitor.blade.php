@extends('layouts.app')

@section('title', 'Monitor - ' . $router->name)

@section('content')
<h1>Dashboard Monitoring: {{ $router->name }} ({{ $router->host }}) ?? Online</h1>

<div style="display: flex; gap: 20px; margin-bottom: 20px;">
    <div style="border: 1px solid #ccc; padding: 15px; width: 200px; text-align: center; background: #e2e3e5;">
        <h3>PPPoE Total</h3>
        <h1 style="color: #333;">{{ $totalPPP }}</h1>
    </div>
    <div style="border: 1px solid #ccc; padding: 15px; width: 200px; text-align: center; background: #d4edda;">
        <h3>Klien Online</h3>
        <h1 style="color: green;">{{ $onlinePPP }}</h1>
    </div>
    <div style="border: 1px solid #ccc; padding: 15px; width: 200px; text-align: center; background: #f8d7da;">
        <h3>Klien Offline</h3>
        <h1 style="color: red;">{{ $offlinePPP }}</h1>
    </div>
</div>

<div style="display: flex; gap: 20px;">
    <div style="flex: 1; border: 1px solid #ccc; padding: 15px;">
        <h2>System Info (Mikrotik)</h2>
        <ul style="line-height: 1.8;">
            <li><b>Board Name:</b> {{ $boardName }}</li>
            <li><b>Version:</b> {{ $version }}</li>
            <li><b>Uptime:</b> <span style="color: blue">{{ $uptime }}</span></li>
            <li><b>CPU Load:</b> {{ $cpu }}%</li>
            <li><b>Memory Usage:</b> {{ $memUsage }}%</li>
        </ul>

        <h2>Pilih Interface untuk Trafik:</h2>
        <select id="interfaceSelect" onchange="window.resetChart()" style="padding: 5px; font-size: 16px;">
            @foreach($interfaces as $iface)
                <option value="{{ $iface['name'] }}">{{ $iface['name'] }} ({{ isset($iface['running']) && $iface['running'] == 'true' ? 'RUNNING' : 'DOWN' }})</option>
            @endforeach
        </select>
        
        <br><br>
        <h4>List Semua Interface:</h4>
        <div style="max-height: 200px; overflow-y: auto; border: 1px solid #eee; padding: 5px;">
            <ul style="margin: 0; padding-left: 20px;">
                @foreach($interfaces as $iface)
                    <li style="color: {{ isset($iface['running']) && $iface['running'] == 'true' ? 'green' : 'red' }}">
                        {{ $iface['name'] }} [{{ $iface['type'] ?? '-' }}] - {{ isset($iface['running']) && $iface['running'] == 'true' ? 'Running' : 'Not Running' }}
                    </li>
                @endforeach
            </ul>
        </div>
    </div>

    <div style="flex: 2; border: 1px solid #ccc; padding: 15px;">
        <h2>Live Traffic (Realtime) ??</h2>
        <div style="text-align: center; margin-bottom: 10px;">
            <span style="color: rgba(255, 99, 132, 1); font-weight: bold;">TX: <span id="txVal">0</span> Mbps</span> | 
            <span style="color: rgba(54, 162, 235, 1); font-weight: bold;">RX: <span id="rxVal">0</span> Mbps</span>
        </div>
        <canvas id="trafficChart" width="400" height="200"></canvas>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
    const ctx = document.getElementById("trafficChart").getContext("2d");
    let trafficChart;
    const maxDataPoints = 30; // Simpan 30 detik terakhir

    function initChart() {
        trafficChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: Array(maxDataPoints).fill(""),
                datasets: [
                    { label: "TX (Mbps)", data: Array(maxDataPoints).fill(0), borderColor: "rgba(255, 99, 132, 1)", backgroundColor: "rgba(255, 99, 132, 0.2)", tension: 0.1, fill: true },
                    { label: "RX (Mbps)", data: Array(maxDataPoints).fill(0), borderColor: "rgba(54, 162, 235, 1)", backgroundColor: "rgba(54, 162, 235, 0.2)", tension: 0.1, fill: true }
                ]
            },
            options: { animation: false, scales: { y: { beginAtZero: true } } }
        });
    }

    window.resetChart = function() {
        trafficChart.data.datasets[0].data = Array(maxDataPoints).fill(0);
        trafficChart.data.datasets[1].data = Array(maxDataPoints).fill(0);
        trafficChart.update();
    }

    function fetchData() {
        const interfaceName = document.getElementById("interfaceSelect").value;
        fetch(/routers/{{ $router->id }}/traffic?interface= + interfaceName)
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    const txMbps = (data.tx / 1000000).toFixed(2);
                    const rxMbps = (data.rx / 1000000).toFixed(2);

                    document.getElementById("txVal").innerText = txMbps;
                    document.getElementById("rxVal").innerText = rxMbps;

                    const labels = trafficChart.data.labels;
                    const txData = trafficChart.data.datasets[0].data;
                    const rxData = trafficChart.data.datasets[1].data;

                    labels.push(new Date().toLocaleTimeString());
                    labels.shift();

                    txData.push(txMbps);
                    txData.shift();

                    rxData.push(rxMbps);
                    rxData.shift();

                    trafficChart.update();
                } else {
                    document.getElementById("txVal").innerText = "Err";
                    document.getElementById("rxVal").innerText = "Err";
                }
            })
            .catch(console.error);
    }

    initChart();
    setInterval(fetchData, 2000); // Tembak API setiap 2 detik
</script>
@endsection
