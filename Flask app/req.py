import requests

def check_api():
    url = 'http://192.168.0.72:5000/api/sellers'
    try:
        response = requests.get(url)
        if response.status_code == 200:
            print('API is working. Response:')
            print(response.json())
        else:
            print(f'Error: Received status code {response.status_code}')
    except requests.exceptions.RequestException as e:
        print(f'Error: {e}')

if __name__ == '__main__':
    check_api()
