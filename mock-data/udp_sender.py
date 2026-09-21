import socket
import struct
import time
import math
import random

UDP_IP = "127.0.0.1"
UDP_PORT = 9000

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
print(f"Starting Monza GT3 track simulator on {UDP_IP}:{UDP_PORT}...")

current_lap_target = random.uniform(107.0, 109.0) 
last_lap_time_ms = 0
lap_start_time = time.time()
last_speed = 0.0

try:
    while True:
        current_time = time.time()
        elapsed_time = current_time - lap_start_time
        
        if elapsed_time >= current_lap_target:
            last_lap_time_ms = int(current_lap_target * 1000)
            current_lap_target = random.uniform(107.0, 109.0)
            lap_start_time = current_time
            elapsed_time = 0.0

        progress = elapsed_time / current_lap_target

        wave = math.sin(progress * math.pi * 10) 
        
        speed_kmh = 170.0 + (wave * 100.0) 

        if speed_kmh > last_speed:
            throttle = 1.0  
            brake = 0.0
        else:
            throttle = 0.0
            brake = min(1.0, (last_speed - speed_kmh) / 1.5)
            if brake < 0.1: brake = 0.1

        if speed_kmh < 90:
            gear = 2
            base_spd, top_spd = 0, 90
        elif speed_kmh < 140:
            gear = 3
            base_spd, top_spd = 90, 140
        elif speed_kmh < 190:
            gear = 4
            base_spd, top_spd = 140, 190
        elif speed_kmh < 240:
            gear = 5
            base_spd, top_spd = 190, 240
        else:
            gear = 6
            base_spd, top_spd = 240, 300

        rpm_ratio = (speed_kmh - base_spd) / (top_spd - base_spd)
        rpm = 4000 + (rpm_ratio * 4500)

        last_speed = speed_kmh

        packet = struct.pack('<fiiffi', 
                             speed_kmh, gear, int(rpm), 
                             throttle, brake, last_lap_time_ms)
        
        sock.sendto(packet, (UDP_IP, UDP_PORT))
        
        time.sleep(0.016) 

except KeyboardInterrupt:
    print("\nStopped.")