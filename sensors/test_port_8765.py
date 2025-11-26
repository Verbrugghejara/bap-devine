import socket

def check_port(host, port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(2)
        result = sock.connect_ex((host, port))
        if result == 0:
            print(f"Port {port} on {host} is OPEN!")
        else:
            print(f"Port {port} on {host} is CLOSED or unreachable.")

if __name__ == "__main__":
    check_port("192.168.0.123", 8765)
