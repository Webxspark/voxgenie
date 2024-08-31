import psutil
import GPUtil

def get_system_usage():
    # Get CPU usage
    cpu_usage = psutil.cpu_percent(interval=1)
    
    # Get RAM usage
    ram_usage = psutil.virtual_memory()
    ram_total = ram_usage.total / (1024 ** 3)  # Convert bytes to GB
    ram_used = ram_usage.used / (1024 ** 3)  # Convert bytes to GB
    ram_percentage = ram_usage.percent

    # Get GPU usage
    gpus = GPUtil.getGPUs()
    gpu_info = []
    for gpu in gpus:
        gpu_info.append({
            "GPU Name": gpu.name,
            "GPU Load": gpu.load * 100,
            "GPU Free Memory": gpu.memoryFree,
            "GPU Used Memory": gpu.memoryUsed,
            "GPU Total Memory": gpu.memoryTotal,
            "GPU Temperature": gpu.temperature
        })

    # Print the results
    print(f"CPU Usage: {cpu_usage}%")
    print(f"RAM Usage: {ram_used:.2f} GB / {ram_total:.2f} GB ({ram_percentage}%)")
    for i, gpu in enumerate(gpu_info):
        print(f"GPU {i}:")
        print(f"  Name: {gpu['GPU Name']}")
        print(f"  Load: {gpu['GPU Load']:.2f}%")
        print(f"  Free Memory: {gpu['GPU Free Memory']} MB")
        print(f"  Used Memory: {gpu['GPU Used Memory']} MB")
        print(f"  Total Memory: {gpu['GPU Total Memory']} MB")
        print(f"  Temperature: {gpu['GPU Temperature']} C")

# Run the function
get_system_usage()
