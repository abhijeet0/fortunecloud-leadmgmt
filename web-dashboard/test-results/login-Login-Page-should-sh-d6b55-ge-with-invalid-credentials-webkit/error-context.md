# Page snapshot

```yaml
- generic [ref=e1]:
  - main [ref=e5]:
    - generic [ref=e7]:
      - heading "Fortune Cloud Admin" [level=1] [ref=e8]
      - paragraph [ref=e9]: Welcome back! Please login to continue.
      - generic [ref=e10]:
        - generic [ref=e11]:
          - generic [ref=e12]: Email
          - textbox "Email" [ref=e13]:
            - /placeholder: admin@fortunecloud.com
            - text: invalid@example.com
        - generic [ref=e14]:
          - generic [ref=e15]: Password
          - textbox "Password" [active] [ref=e16]:
            - /placeholder: Enter your password
            - text: wrongpassword
        - button "Login" [ref=e17] [cursor=pointer]
  - iframe [ref=e18]:
    - generic [ref=f1e2]:
      - generic [ref=f1e3]: "Uncaught runtime errors:"
      - button "Dismiss" [ref=f1e4] [cursor=pointer]: ×
      - generic [ref=f1e6]:
        - generic [ref=f1e7]: ERROR
        - generic [ref=f1e8]: "Messaging: This browser doesn't support the API's required to use the Firebase SDK. (messaging/unsupported-browser). create@http://localhost:3000/static/js/bundle.js:5249:36 @http://localhost:3000/static/js/bundle.js:4135:33"
  - iframe [ref=e19]:
    
```