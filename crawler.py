import requests
from bs4 import BeautifulSoup
import json
import time
import random

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
}

def get_pet_list(page=1):
    url = f'https://www-next.epet.com/goods/?page={page}'
    
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        items = []
        
        product_list = soup.select('.goods-list .goods-item')
        
        for item in product_list:
            try:
                name = item.select_one('.goods-name, .name, h3')
                price = item.select_one('.price, .goods-price')
                image = item.select_one('img')
                link = item.select_one('a')
                
                pet_data = {
                    'name': name.get_text(strip=True) if name else '',
                    'price': price.get_text(strip=True) if price else '',
                    'image': image.get('src') or image.get('data-src') if image else '',
                    'link': 'https://www-next.epet.com' + link.get('href') if link else ''
                }
                
                if pet_data['name']:
                    items.append(pet_data)
            except Exception as e:
                print(f"解析商品失败: {e}")
                continue
        
        return items
        
    except requests.RequestException as e:
        print(f"请求失败: {e}")
        return []

def save_to_file(data, filename='pets.json'):
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"数据已保存到 {filename}")

def main():
    all_pets = []
    
    print("开始爬取宠物数据...")
    
    for page in range(1, 4):
        print(f"正在爬取第 {page} 页...")
        pets = get_pet_list(page)
        
        if not pets:
            print(f"第 {page} 页没有数据")
            break
            
        all_pets.extend(pets)
        print(f"第 {page} 页获取 {len(pets)} 条数据")
        
        time.sleep(random.uniform(1, 3))
    
    print(f"\n共获取 {len(all_pets)} 条数据")
    
    if all_pets:
        save_to_file(all_pets)
    else:
        print("未获取到数据")

if __name__ == '__main__':
    main()
