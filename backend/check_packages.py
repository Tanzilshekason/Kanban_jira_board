import subprocess
import sys

def get_installed_packages():
    result = subprocess.run([sys.executable, '-m', 'pip', 'list', '--format=freeze'], capture_output=True, text=True)
    packages = {}
    for line in result.stdout.strip().split('\n'):
        if '==' in line:
            name, version = line.split('==', 1)
            packages[name.lower()] = version
    return packages

def parse_requirements(filepath):
    requirements = []
    with open(filepath, 'r') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            # Handle cases like "urllib3==2.6.3django-cors-headers==4.3.1"
            # Split by '==' but careful with version numbers
            # Simple approach: split by whitespace
            parts = line.split()
            for part in parts:
                if '==' in part:
                    name, version = part.split('==', 1)
                    requirements.append((name, version))
    return requirements

def main():
    installed = get_installed_packages()
    reqs = parse_requirements('requirements.txt')
    
    missing = []
    for name, version in reqs:
        if name.lower() not in installed:
            missing.append(f"{name}=={version}")
        else:
            installed_version = installed[name.lower()]
            if installed_version != version:
                print(f"Version mismatch: {name} required {version}, installed {installed_version}")
    
    if missing:
        print("Missing packages:")
        for pkg in missing:
            print(pkg)
    else:
        print("All packages are installed.")
    
    return missing

if __name__ == '__main__':
    main()