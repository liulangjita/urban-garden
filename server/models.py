import sqlite3
import json
import os

DATABASE_PATH = os.path.join(os.path.dirname(__file__), 'database.db')


def get_db():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # 创建行政区划表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS regions (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            level TEXT NOT NULL,
            lat REAL,
            lng REAL,
            parent_id TEXT,
            FOREIGN KEY (parent_id) REFERENCES regions(id)
        )
    ''')

    # 创建园区表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS gardens (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            address TEXT NOT NULL,
            lat REAL NOT NULL,
            lng REAL NOT NULL,
            description TEXT,
            thumb TEXT,
            region_id TEXT,
            FOREIGN KEY (region_id) REFERENCES regions(id)
        )
    ''')

    # 创建地块表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS plots (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            sub_title TEXT,
            location TEXT,
            area REAL,
            soil_type TEXT,
            light_condition TEXT,
            water_price REAL,
            annual_rent REAL,
            description TEXT,
            owner_name TEXT,
            owner_phone TEXT,
            owner_avatar TEXT,
            images TEXT,
            tags TEXT,
            status TEXT DEFAULT 'available',
            garden_id TEXT NOT NULL,
            FOREIGN KEY (garden_id) REFERENCES gardens(id)
        )
    ''')

    # 创建用户表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            phone TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            password TEXT NOT NULL,
            avatar TEXT,
            is_landlord INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # 创建消息表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            sender_id TEXT NOT NULL,
            sender_phone TEXT,
            sender_name TEXT,
            receiver_id TEXT NOT NULL,
            receiver_name TEXT,
            content TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            read INTEGER DEFAULT 0,
            FOREIGN KEY (sender_id) REFERENCES users(id),
            FOREIGN KEY (receiver_id) REFERENCES users(id)
        )
    ''')

    conn.commit()
    conn.close()


def seed_data():
    conn = get_db()
    cursor = conn.cursor()

    # 检查是否已有数据
    cursor.execute('SELECT COUNT(*) FROM regions')
    if cursor.fetchone()[0] > 0:
        conn.close()
        return

    # 插入行政区划 - 与前端constants.ts完全一致
    regions = [
        ('zhejiang', '浙江省', 'province', 29.14, 120.15, None),
        ('hangzhou', '杭州市', 'city', 30.27, 120.15, 'zhejiang'),
        ('xihu', '西湖区', 'district', 30.23, 120.12, 'hangzhou'),
        ('gongshu', '拱墅区', 'district', 30.32, 120.15, 'hangzhou'),
        ('ningbo', '宁波市', 'city', 29.86, 121.54, 'zhejiang'),
        ('beijing', '北京市', 'province', 39.90, 116.40, None),
        ('chaoyang', '朝阳区', 'district', 39.92, 116.48, 'beijing'),  # 北京朝阳
        ('haidian', '海淀区', 'district', 39.95, 116.30, 'beijing'),
        ('shanghai', '上海市', 'province', 31.23, 121.47, None),
        ('minhang', '闵行区', 'district', 31.11, 121.37, 'shanghai'),
        ('guangdong', '广东省', 'province', 23.12, 113.26, None),
        ('guangzhou', '广州市', 'city', 23.12, 113.26, 'guangdong'),
        ('shenzhen', '深圳市', 'city', 22.54, 114.05, 'guangdong'),
        ('hebei', '河北省', 'province', 38.04, 114.51, None),
        ('shijiazhuang', '石家庄市', 'city', 38.04, 114.51, 'hebei'),
        ('changan', '长安区', 'district', 38.06, 114.54, 'shijiazhuang'),
        ('baoding', '保定市', 'city', 38.87, 115.46, 'hebei'),
    ]

    cursor.executemany(
        'INSERT INTO regions (id, name, level, lat, lng, parent_id) VALUES (?, ?, ?, ?, ?, ?)',
        regions
    )

    # 插入园区 - 与前端constants.ts完全一致
    gardens = [
        ('gc1', '西湖龙井园', '浙江省杭州市西湖区龙井路88号', 30.23, 120.12, '位于风景优美的龙井村附近，土壤肥沃，水源充足。', 'https://images.unsplash.com/photo-1592150621344-82d67abb9dfa?q=80&w=500&auto=format&fit=crop', 'xihu'),
        ('gc2', '双浦生态开发区', '浙江省杭州市西湖区双浦镇', 30.15, 120.08, '大型现代化农业园区，配套设施齐全。', 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=500&auto=format&fit=crop', 'xihu'),
        ('gc3', '北京朝阳都市菜园', '北京市朝阳区北五环外', 40.0, 116.48, '朝阳区最大的都市农业园。', 'https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=500&auto=format&fit=crop', 'chaoyang'),
        ('gc4', '上海闵行开心农场', '上海市闵行区浦江镇', 31.05, 121.52, '离市中心近，周末亲子好去处。', 'https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?q=80&w=500&auto=format&fit=crop', 'minhang'),
        ('gc-hebei-1', '长安绿色氧吧', '河北省石家庄市长安区复兴大街侧', 38.06, 114.54, '石家庄北部的现代农业示范区。', 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=500&auto=format&fit=crop', 'changan'),
    ]

    cursor.executemany(
        'INSERT INTO gardens (id, name, address, lat, lng, description, thumb, region_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        gardens
    )

    # 插入地块 - 与前端constants.ts完全一致
    # 基础地块模板数据
    base_images = json.dumps(['https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=1200&auto=format&fit=crop'])
    base_tags = json.dumps(['蔬菜', '优质土壤'])
    base_owner_avatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=250&h=250&auto=format&fit=crop'

    plots = [
        # gc1 西湖龙井园的地块
        ('xihu-01', '龙井 #01', "8' x 10' • 肥沃壤土", '西区 04 号地', 20, '壤土混合', '全日照', 0.7, 15, '这块优质的转角地块拥有充足的阳光和肥沃、透气的壤土，非常适合种植时令蔬菜或鲜艳的花卉。', '亚瑟·格林', '13800138001', base_owner_avatar, base_images, base_tags, 'available', 'gc1'),
        ('xihu-02', '龙井 #02', "8' x 10' • 肥沃壤土", '西区 04 号地', 20, '壤土混合', '全日照', 0.7, 18, '这块优质的转角地块拥有充足的阳光和肥沃、透气的壤土，非常适合种植时令蔬菜或鲜艳的花卉。', '亚瑟·格林', '13800138001', base_owner_avatar, base_images, base_tags, 'available', 'gc1'),

        # gc2 双浦生态开发区
        ('shuangpu-01', '双浦 #01', "8' x 10' • 肥沃壤土", '西区 04 号地', 20, '壤土混合', '全日照', 0.7, 12, '这块优质的转角地块拥有充足的阳光和肥沃、透气的壤土，非常适合种植时令蔬菜或鲜艳的花卉。', '亚瑟·格林', '13800138001', base_owner_avatar, base_images, base_tags, 'available', 'gc2'),

        # gc3 北京朝阳都市菜园
        ('chaoyang-01', '朝阳 #01', "8' x 10' • 肥沃壤土", '西区 04 号地', 20, '壤土混合', '全日照', 0.7, 15, '这块优质的转角地块拥有充足的阳光和肥沃、透气的壤土，非常适合种植时令蔬菜或鲜艳的花卉。', '亚瑟·格林', '13800138001', base_owner_avatar, base_images, base_tags, 'available', 'gc3'),

        # gc4 上海闵行开心农场
        ('minhang-01', '闵行 #01', "8' x 10' • 肥沃壤土", '西区 04 号地', 20, '壤土混合', '全日照', 0.7, 15, '这块优质的转角地块拥有充足的阳光和肥沃、透气的壤土，非常适合种植时令蔬菜或鲜艳的花卉。', '亚瑟·格林', '13800138001', base_owner_avatar, base_images, base_tags, 'available', 'gc4'),

        # gc-hebei-1 长安绿色氧吧
        ('sjz-01', '长安 #01', "10' x 10' • 优质土质", '长安区示范园', 25, '沙质壤土', '全日照', 0.8, 20, '土质疏松，适合种植根茎类蔬菜。', '张大爷', '13800138005', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250&h=250&auto=format&fit=crop', json.dumps(['https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=1200']), json.dumps(['快速出苗']), 'available', 'gc-hebei-1'),
    ]

    cursor.executemany(
        'INSERT INTO plots (id, title, sub_title, location, area, soil_type, light_condition, water_price, annual_rent, description, owner_name, owner_phone, owner_avatar, images, tags, status, garden_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        plots
    )

    conn.commit()
    conn.close()


def row_to_dict(row):
    return dict(row)


def get_regions():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM regions')
    rows = cursor.fetchall()
    conn.close()
    return [row_to_dict(row) for row in rows]


def get_region_tree():
    conn = get_db()
    cursor = conn.cursor()

    # 获取所有区域
    cursor.execute('SELECT * FROM regions')
    rows = cursor.fetchall()
    regions = [row_to_dict(row) for row in rows]

    # 获取所有园区
    cursor.execute('SELECT * FROM gardens')
    garden_rows = cursor.fetchall()
    gardens = [row_to_dict(row) for row in garden_rows]

    # 获取所有地块
    cursor.execute('SELECT * FROM plots')
    plot_rows = cursor.fetchall()
    plots = [row_to_dict(row) for row in plot_rows]

    conn.close()

    # 构建树形结构
    def build_tree(parent_id=None):
        children = []
        for r in regions:
            if r['parent_id'] == parent_id:
                node = {
                    'id': r['id'],
                    'name': r['name'],
                    'level': r['level'],
                    'coordinates': {'lat': r['lat'], 'lng': r['lng']} if r['lat'] and r['lng'] else None,
                    'children': build_tree(r['id']),
                    'gardens': []
                }
                # 添加园区
                for g in gardens:
                    if g['region_id'] == r['id']:
                        garden = {
                            'id': g['id'],
                            'name': g['name'],
                            'address': g['address'],
                            'coordinates': {'lat': g['lat'], 'lng': g['lng']},
                            'description': g['description'],
                            'thumb': g['thumb'],
                            'plots': []
                        }
                        # 添加地块
                        for p in plots:
                            if p['garden_id'] == g['id']:
                                plot = {
                                    'id': p['id'],
                                    'title': p['title'],
                                    'subTitle': p['sub_title'],
                                    'location': p['location'],
                                    'area': p['area'],
                                    'soilType': p['soil_type'],
                                    'lightCondition': p['light_condition'],
                                    'waterPrice': p['water_price'],
                                    'annualRent': p['annual_rent'],
                                    'description': p['description'],
                                    'owner': {
                                        'name': p['owner_name'],
                                        'phone': p['owner_phone'],
                                        'avatar': p['owner_avatar']
                                    },
                                    'images': json.loads(p['images']) if p['images'] else [],
                                    'tags': json.loads(p['tags']) if p['tags'] else [],
                                    'status': p['status']
                                }
                                garden['plots'].append(plot)
                        node['gardens'].append(garden)
                children.append(node)
        return children

    return build_tree()


def get_gardens():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM gardens')
    rows = cursor.fetchall()
    conn.close()
    return [row_to_dict(row) for row in rows]


def get_garden_by_id(garden_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM gardens WHERE id = ?', (garden_id,))
    row = cursor.fetchone()
    conn.close()
    return row_to_dict(row) if row else None


def format_plot(plot):
    """将数据库字段格式化为前端期望的格式"""
    plot['subTitle'] = plot.pop('sub_title', '')
    plot['soilType'] = plot.pop('soil_type', '')
    plot['lightCondition'] = plot.pop('light_condition', '')
    plot['waterPrice'] = plot.pop('water_price', 0)
    plot['annualRent'] = plot.pop('annual_rent', 0)
    # 移除不需要的字段
    plot.pop('owner_name', None)
    plot.pop('owner_phone', None)
    plot.pop('owner_avatar', None)
    plot.pop('garden_id', None)
    return plot


def get_plots():
    """获取地块列表 - 用于API，返回camelCase格式"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM plots')
    rows = cursor.fetchall()
    plots = []
    for row in rows:
        plot = row_to_dict(row)
        plot['images'] = json.loads(plot['images']) if plot['images'] else []
        plot['tags'] = json.loads(plot['tags']) if plot['tags'] else []
        plot['owner'] = {
            'name': plot['owner_name'],
            'phone': plot['owner_phone'],
            'avatar': plot['owner_avatar']
        }
        plot = format_plot(plot)
        plots.append(plot)
    conn.close()
    return plots


def get_plots_for_admin():
    """获取地块列表 - 用于后台管理，保留snake_case字段名"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM plots')
    rows = cursor.fetchall()
    plots = []
    for row in rows:
        plot = row_to_dict(row)
        # 处理images和tags为字符串形式用于显示
        images = json.loads(plot['images']) if plot['images'] else []
        plot['images'] = ','.join(images) if images else ''
        tags = json.loads(plot['tags']) if plot['tags'] else []
        plot['tags'] = ','.join(tags) if tags else ''
        plots.append(plot)
    conn.close()
    return plots


def get_plot_by_id(plot_id):
    """获取单个地块 - 用于API，返回camelCase格式"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM plots WHERE id = ?', (plot_id,))
    row = cursor.fetchone()
    if row:
        plot = row_to_dict(row)
        plot['images'] = json.loads(plot['images']) if plot['images'] else []
        plot['tags'] = json.loads(plot['tags']) if plot['tags'] else []
        plot['owner'] = {
            'name': plot['owner_name'],
            'phone': plot['owner_phone'],
            'avatar': plot['owner_avatar']
        }
        plot = format_plot(plot)
        conn.close()
        return plot
    conn.close()
    return None


def get_plot_for_admin(plot_id):
    """获取单个地块 - 用于后台管理编辑"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM plots WHERE id = ?', (plot_id,))
    row = cursor.fetchone()
    if row:
        plot = row_to_dict(row)
        # 处理images和tags为字符串形式
        images = json.loads(plot['images']) if plot['images'] else []
        plot['images'] = ','.join(images) if images else ''
        tags = json.loads(plot['tags']) if plot['tags'] else []
        plot['tags'] = ','.join(tags) if tags else ''
        conn.close()
        return plot
    conn.close()
    return None


def get_plots_by_garden(garden_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM plots WHERE garden_id = ?', (garden_id,))
    rows = cursor.fetchall()
    plots = []
    for row in rows:
        plot = row_to_dict(row)
        plot['images'] = json.loads(plot['images']) if plot['images'] else []
        plot['tags'] = json.loads(plot['tags']) if plot['tags'] else []
        plot['owner'] = {
            'name': plot['owner_name'],
            'phone': plot['owner_phone'],
            'avatar': plot['owner_avatar']
        }
        plot = format_plot(plot)
        plots.append(plot)
    conn.close()
    return plots


def create_plot(data):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO plots (id, title, sub_title, location, area, soil_type, light_condition, water_price, annual_rent, description, owner_name, owner_phone, owner_avatar, images, tags, status, garden_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        (
            data.get('id'),
            data.get('title'),
            data.get('subTitle', ''),
            data.get('location', ''),
            data.get('area', 0),
            data.get('soilType', ''),
            data.get('lightCondition', ''),
            data.get('waterPrice', 0),
            data.get('annualRent', 0),
            data.get('description', ''),
            data.get('owner', {}).get('name', ''),
            data.get('owner', {}).get('phone', ''),
            data.get('owner', {}).get('avatar', ''),
            json.dumps(data.get('images', [])),
            json.dumps(data.get('tags', [])),
            data.get('status', 'available'),
            data.get('gardenId')
        )
    )
    conn.commit()
    conn.close()
    return data


def update_plot(plot_id, data):
    conn = get_db()
    cursor = conn.cursor()

    # 构建更新语句
    updates = []
    values = []

    if 'title' in data:
        updates.append('title = ?')
        values.append(data['title'])
    if 'subTitle' in data:
        updates.append('sub_title = ?')
        values.append(data['subTitle'])
    if 'location' in data:
        updates.append('location = ?')
        values.append(data['location'])
    if 'area' in data:
        updates.append('area = ?')
        values.append(data['area'])
    if 'soilType' in data:
        updates.append('soil_type = ?')
        values.append(data['soilType'])
    if 'lightCondition' in data:
        updates.append('light_condition = ?')
        values.append(data['lightCondition'])
    if 'waterPrice' in data:
        updates.append('water_price = ?')
        values.append(data['waterPrice'])
    if 'annualRent' in data:
        updates.append('annual_rent = ?')
        values.append(data['annualRent'])
    if 'description' in data:
        updates.append('description = ?')
        values.append(data['description'])
    if 'owner' in data:
        updates.append('owner_name = ?')
        updates.append('owner_phone = ?')
        updates.append('owner_avatar = ?')
        values.append(data['owner'].get('name', ''))
        values.append(data['owner'].get('phone', ''))
        values.append(data['owner'].get('avatar', ''))
    if 'images' in data:
        updates.append('images = ?')
        values.append(json.dumps(data['images']))
    if 'tags' in data:
        updates.append('tags = ?')
        values.append(json.dumps(data['tags']))
    if 'status' in data:
        updates.append('status = ?')
        values.append(data['status'])
    if 'gardenId' in data:
        updates.append('garden_id = ?')
        values.append(data['gardenId'])

    if updates:
        values.append(plot_id)
        cursor.execute(
            f'UPDATE plots SET {", ".join(updates)} WHERE id = ?',
            values
        )
        conn.commit()

    conn.close()
    return get_plot_by_id(plot_id)


def delete_plot(plot_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM plots WHERE id = ?', (plot_id,))
    conn.commit()
    conn.close()


def create_garden(data):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO gardens (id, name, address, lat, lng, description, thumb, region_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        (
            data.get('id'),
            data.get('name'),
            data.get('address'),
            data.get('coordinates', {}).get('lat', 0),
            data.get('coordinates', {}).get('lng', 0),
            data.get('description', ''),
            data.get('thumb', ''),
            data.get('regionId')
        )
    )
    conn.commit()
    conn.close()
    return data


def update_garden(garden_id, data):
    conn = get_db()
    cursor = conn.cursor()

    updates = []
    values = []

    if 'name' in data:
        updates.append('name = ?')
        values.append(data['name'])
    if 'address' in data:
        updates.append('address = ?')
        values.append(data['address'])
    if 'coordinates' in data:
        updates.append('lat = ?')
        updates.append('lng = ?')
        values.append(data['coordinates'].get('lat', 0))
        values.append(data['coordinates'].get('lng', 0))
    if 'description' in data:
        updates.append('description = ?')
        values.append(data['description'])
    if 'thumb' in data:
        updates.append('thumb = ?')
        values.append(data['thumb'])
    if 'regionId' in data:
        updates.append('region_id = ?')
        values.append(data['regionId'])

    if updates:
        values.append(garden_id)
        cursor.execute(
            f'UPDATE gardens SET {", ".join(updates)} WHERE id = ?',
            values
        )
        conn.commit()

    conn.close()
    return get_garden_by_id(garden_id)


def delete_garden(garden_id):
    conn = get_db()
    cursor = conn.cursor()
    # 先删除关联的地块
    cursor.execute('DELETE FROM plots WHERE garden_id = ?', (garden_id,))
    cursor.execute('DELETE FROM gardens WHERE id = ?', (garden_id,))
    conn.commit()
    conn.close()


def get_stats():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('SELECT COUNT(*) FROM plots')
    total_plots = cursor.fetchone()[0]

    cursor.execute('SELECT COUNT(*) FROM plots WHERE status = "rented"')
    rented_count = cursor.fetchone()[0]

    cursor.execute('SELECT SUM(area * annual_rent) FROM plots WHERE status = "rented"')
    monthly_revenue = cursor.fetchone()[0] or 0

    conn.close()

    return {
        'totalPlots': total_plots,
        'rentedCount': rented_count,
        'monthlyRevenue': monthly_revenue
    }


# 用户相关函数
import uuid
from datetime import datetime

def get_user_by_phone(phone):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE phone = ?', (phone,))
    row = cursor.fetchone()
    conn.close()
    return row_to_dict(row) if row else None


def get_user_by_id(user_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
    row = cursor.fetchone()
    conn.close()
    return row_to_dict(row) if row else None


def create_user(phone, name, password, is_landlord=False):
    conn = get_db()
    cursor = conn.cursor()
    user_id = str(uuid.uuid4())
    cursor.execute(
        'INSERT INTO users (id, phone, name, password, avatar, is_landlord) VALUES (?, ?, ?, ?, ?, ?)',
        (
            user_id,
            phone,
            name,
            password,
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=250&h=250&auto=format&fit=crop',
            1 if is_landlord else 0
        )
    )
    conn.commit()
    conn.close()
    return {
        'id': user_id,
        'phone': phone,
        'name': name,
        'avatar': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=250&h=250&auto=format&fit=crop',
        'isLandlord': is_landlord
    }


def check_user_exists(phone):
    """检查手机号是否已注册，同时检查是否是地主"""
    conn = get_db()
    cursor = conn.cursor()

    # 检查用户表
    cursor.execute('SELECT * FROM users WHERE phone = ?', (phone,))
    user_row = cursor.fetchone()

    # 检查地块表（地主）
    cursor.execute('SELECT * FROM plots WHERE owner_phone = ?', (phone,))
    plot_row = cursor.fetchone()

    conn.close()

    if user_row:
        return {'exists': True, 'isLandlord': user_row['is_landlord'] == 1}

    if plot_row:
        return {'exists': True, 'isLandlord': True}

    return {'exists': False, 'isLandlord': False}


def init_landlord_users():
    """为所有地主创建默认用户账号，密码为123456"""
    conn = get_db()
    cursor = conn.cursor()

    # 获取所有地主手机号
    cursor.execute('SELECT DISTINCT owner_phone, owner_name FROM plots')
    landlords = cursor.fetchall()

    for landlord in landlords:
        phone = landlord['owner_phone']
        name = landlord['owner_name']

        # 检查是否已有账号
        cursor.execute('SELECT * FROM users WHERE phone = ?', (phone,))
        existing = cursor.fetchone()

        if not existing:
            user_id = str(uuid.uuid4())
            cursor.execute(
                'INSERT INTO users (id, phone, name, password, avatar, is_landlord) VALUES (?, ?, ?, ?, ?, ?)',
                (
                    user_id,
                    phone,
                    name,
                    '123456',
                    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=250&h=250&auto=format&fit=crop',
                    1
                )
            )

    conn.commit()
    conn.close()


# 消息相关函数
def get_messages(user_id):
    """获取用户的所有消息，支持UUID和手机号查询"""
    conn = get_db()
    cursor = conn.cursor()

    # 先尝试用UUID查询
    cursor.execute(
        'SELECT * FROM messages WHERE sender_id = ? OR receiver_id = ? ORDER BY created_at DESC',
        (user_id, user_id)
    )
    rows = cursor.fetchall()

    # 如果没找到，可能是用手机号作为ID
    if not rows:
        cursor.execute(
            'SELECT * FROM messages WHERE sender_phone = ? OR receiver_id = ? ORDER BY created_at DESC',
            (user_id, user_id)
        )
        rows = cursor.fetchall()

    messages = []
    for row in rows:
        msg = row_to_dict(row)
        msg['read'] = msg['read'] == 1
        messages.append(msg)
    conn.close()
    return messages


def create_message(data):
    """创建新消息"""
    conn = get_db()
    cursor = conn.cursor()
    msg_id = str(uuid.uuid4())
    created_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    cursor.execute(
        'INSERT INTO messages (id, sender_id, sender_phone, sender_name, receiver_id, receiver_name, content, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        (
            msg_id,
            data['senderId'],
            data['senderPhone'],
            data['senderName'],
            data['receiverId'],
            data['receiverName'],
            data['content'],
            created_at
        )
    )
    conn.commit()
    conn.close()

    return {
        'id': msg_id,
        'senderId': data['senderId'],
        'senderPhone': data['senderPhone'],
        'senderName': data['senderName'],
        'receiverId': data['receiverId'],
        'receiverName': data['receiverName'],
        'content': data['content'],
        'createdAt': created_at,
        'read': False
    }


def mark_message_read(msg_id):
    """标记消息为已读"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('UPDATE messages SET read = 1 WHERE id = ?', (msg_id,))
    conn.commit()
    conn.close()