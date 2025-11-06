## apply-patch Tool Usage Guide

### Basic Syntax
```
apply_patch {"command": ["apply_patch", "*** Begin Patch\\n*** Update File: path/to/file.py\\n@@ def example():\\n- pass\\n+ return 123\\n*** End Patch"]}
```

### Key Rules
- Always use `apply_patch` (NEVER `applypatch` or `apply-patch`)
- Format patches with proper header and footer markers
- Use `*** Begin Patch` and `*** End Patch` as delimiters
- Specify file path with `*** Update File:` or `*** New File:`
- Use unified diff format for changes (`@@ ... @@`)
- Mark removed lines with `-` and added lines with `+`

### Examples

**Editing existing file:**
```
apply_patch {"command": ["apply_patch", "*** Begin Patch\\n*** Update File: src/main.py\\n@@ def hello():\\n-     print("Hello")\\n+     print("Hello World")\\n*** End Patch"]}
```

**Creating new file:**
```
apply_patch {"command": ["apply_patch", "*** Begin Patch\\n*** New File: config.json\\n+{\\n+  \"name\": \"example\",\\n+  \"version\": \"1.0.0\"\\n+}\\n*** End Patch"]}
```

**Multi-line changes:**
```
apply_patch {"command": ["apply_patch", "*** Begin Patch\\n*** Update File: utils.py\\n@@ def process_data(data):\\n-     result = []\\n-     for item in data:\\n-         result.append(item * 2)\\n+     return [item * 2 for item in data]\\n*** End Patch"]}
```

### Important Notes
- Tool call will fail if patch format is invalid
- No need to re-read files after successful patch application
- Changes are applied atomically
- Use proper escaping for special characters in strings
