from locust import HttpUser, task, between
import os

BASE = os.getenv('LOCUST_BASE_URL', 'http://localhost:8080')

class SiteUser(HttpUser):
    wait_time = between(1, 3)

    @task
    def visit_index(self):
        self.client.get(f"{BASE}/templates/index.html")

    @task
    def submit_email_flow(self):
        # 仅作为示例，实际需要后端可路由到 PHP
        self.client.post(f"{BASE}/templates/submit_email.php", data={"email_check": "load_user@example.com"})
        self.client.post(f"{BASE}/templates/submit_email.php", data={"email": "load_user@example.com"})
