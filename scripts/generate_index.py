
import json
import yaml
from datetime import datetime
from pathlib import Path

class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

def process_post(filepath):
    try:
        content = Path(filepath).read_text(encoding='utf-8')
        _, frontmatter, _ = content.split('---\n', 2)
        data = yaml.safe_load(frontmatter)
        
        return {
            'title': data.get('title', Path(filepath).stem),
            'date': datetime.strptime(data['date'], '%Y-%m-%d') if 'date' in data else datetime.now(),
            'slug': data.get('slug', Path(filepath).stem),
            'filepath': str(filepath)
        }
    except Exception as e:
        print(f"Skipping {filepath}: {str(e)}")
        return None

def main():
    posts = []
    posts_dir = Path('posts')
    
    for md_file in posts_dir.glob('**/*.md'):
        if post := process_post(md_file):
            posts.append(post)
    
    posts.sort(key=lambda x: x['date'], reverse=True)
    
    output = {
        'generated_at': datetime.now().isoformat(),
        'post_count': len(posts),
        'posts': posts
    }
    
    with open('posts/list.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, cls=DateTimeEncoder)

if __name__ == '__main__':
    main()
