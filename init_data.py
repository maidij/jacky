import sqlite3
import os
import random

DB_PATH = 'backend/app/pets.db'

PETS_DATA = [
    {"name": "小黄", "species": "dog", "category": "pet", "age": 3, "description": "可爱的小金毛", "image_url": "https://img.gogoshop.cloud/972b1b66/pet1.jpg"},
    {"name": "小白", "species": "cat", "category": "pet", "age": 2, "description": "温柔的英国短毛猫", "image_url": "https://img.gogoshop.cloud/972b1b66/pet2.jpg"},
    {"name": "豆豆", "species": "dog", "category": "pet", "age": 1, "description": "活泼的小泰迪", "image_url": "https://img.gogoshop.cloud/972b1b66/pet3.jpg"},
    {"name": "咪咪", "species": "cat", "category": "pet", "age": 4, "description": "可爱的中华田园猫", "image_url": "https://img.gogoshop.cloud/972b1b66/pet4.jpg"},
    {"name": "皇家猫粮", "species": "cat", "category": "food", "age": 0, "description": "优质猫粮，营养均衡", "image_url": "https://img.gogoshop.cloud/972b1b66/cat1.jpg"},
    {"name": "狗狗罐头", "species": "dog", "category": "food", "age": 0, "description": "美味狗罐头", "image_url": "https://img.gogoshop.cloud/972b1b66/dog1.jpg"},
    {"name": "宠物奶粉", "species": "dog", "category": "food", "age": 0, "description": "宠物专用奶粉", "image_url": "https://img.gogoshop.cloud/972b1b66/milk.jpg"},
    {"name": "猫爬架", "species": "cat", "category": "toy", "age": 0, "description": "多层猫爬架，猫咪最爱", "image_url": "https://img.gogoshop.cloud/972b1b66/cat-tree.jpg"},
    {"name": "发声玩具", "species": "dog", "category": "toy", "age": 0, "description": "狗狗发声玩具", "image_url": "https://img.gogoshop.cloud/972b1b66/dog-toy.jpg"},
    {"name": "逗猫棒", "species": "cat", "category": "toy", "age": 0, "description": "逗猫神器", "image_url": "https://img.gogoshop.cloud/972b1b66/feather.jpg"},
    {"name": "牵引绳", "species": "dog", "category": "other", "age": 0, "description": "遛狗必备牵引绳", "image_url": "https://img.gogoshop.cloud/972b1b66/ leash.jpg"},
    {"name": "猫砂盆", "species": "cat", "category": "other", "age": 0, "description": "封闭式猫砂盆", "image_url": "https://img.gogoshop.cloud/972b1b66/litter.jpg"},
    {"name": "宠物背包", "species": "cat", "category": "other", "age": 0, "description": "透气宠物背包", "image_url": "https://img.gogoshop.cloud/972b1b66/backpack.jpg"},
    {"name": "维生素片", "species": "dog", "category": "medical", "age": 0, "description": "宠物维生素营养补充", "image_url": "https://img.gogoshop.cloud/972b1b66/vitamin.jpg"},
    {"name": "驱虫药", "species": "cat", "category": "medical", "age": 0, "description": "体内外驱虫药", "image_url": "https://img.gogoshop.cloud/972b1b66/deworm.jpg"},
    {"name": "滴眼液", "species": "dog", "category": "medical", "age": 0, "description": "宠物眼部护理液", "image_url": "https://img.gogoshop.cloud/972b1b66/eye-drops.jpg"},
    {"name": "益生菌", "species": "dog", "category": "medical", "age": 0, "description": "调理肠胃益生菌", "image_url": "https://img.gogoshop.cloud/972b1b66/probiotic.jpg"},
    {"name": "磨牙棒", "species": "dog", "category": "toy", "age": 0, "description": "狗狗磨牙零食", "image_url": "https://img.gogoshop.cloud/972b1b66/chew.jpg"},
    {"name": "自动饮水机", "species": "cat", "category": "other", "age": 0, "description": "宠物自动饮水机", "image_url": "https://img.gogoshop.cloud/972b1b66/water.jpg"},
]

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='pets'")
    if not cursor.fetchone():
        cursor.execute('''
            CREATE TABLE pets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                species TEXT NOT NULL,
                category TEXT DEFAULT 'food',
                age INTEGER NOT NULL,
                description TEXT DEFAULT '',
                image_url TEXT DEFAULT '',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
    
    cursor.execute("SELECT COUNT(*) FROM pets")
    count = cursor.fetchone()[0]
    
    if count == 0:
        print("正在添加宠物数据...")
        for pet in PETS_DATA:
            cursor.execute('''
                INSERT INTO pets (name, species, category, age, description, image_url)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (pet['name'], pet['species'], pet['category'], pet['age'], pet['description'], pet['image_url']))
        conn.commit()
        print(f"已添加 {len(PETS_DATA)} 条数据")
    else:
        print(f"数据库已有 {count} 条数据")
    
    conn.close()

if __name__ == '__main__':
    init_db()
