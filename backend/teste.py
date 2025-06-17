import redis

r = redis.Redis(host='192.168.22.29', port=6379, password='KOLZEoUP2KMolrglELJ1Mdi7Fnj1JRSqYgRh6cJTnOb7XemFqVG3e9az5M1SUuWA')
print(r.ping())  # Deve retornar True
