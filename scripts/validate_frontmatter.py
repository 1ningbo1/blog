
import os
import yaml
from pathlib import Path

def validate_file(filepath):
    try:
        content = Path(filepath).read_text(encoding='utf-8')
        if not content.startswith('---\n'):
            raise ValueError("Missing frontmatter start delimiter")
        parts = content.split('---\n', 2)
        if len(parts) < 3:
            raise ValueError("Incomplete frontmatter section")
        yaml.safe_load(parts[1])
        return True
    except Exception as e:
        print(f"Validation failed for {filepath}: {str(e)}")
        return False

if __name__ == '__main__':
    posts_dir = Path('posts')
    invalid_files = []
    
    for md_file in posts_dir.glob('**/*.md'):
        if not validate_file(md_file):
            invalid_files.append(str(md_file))
    
    if invalid_files:
        raise SystemExit(f"Invalid frontmatter in files: {', '.join(invalid_files)}")
