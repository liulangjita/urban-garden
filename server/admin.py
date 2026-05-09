import os
import json
import uuid
from flask import Flask, render_template, redirect, request, url_for, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import models

load_dotenv()

app = Flask(__name__)
CORS(app)
app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-key')


# 后台管理页面
@app.route('/')
def dashboard():
    stats = models.get_stats()
    plots = models.get_plots_for_admin()
    return render_template('dashboard.html', stats=stats, plots=plots, active_page='dashboard')


@app.route('/plots')
def plots_list():
    plots = models.get_plots_for_admin()
    return render_template('plots.html', plots=plots, active_page='plots')


@app.route('/plots/new')
def plot_new():
    plot = {}
    gardens = models.get_gardens()
    return render_template('plot_form.html', plot=plot, gardens=gardens, active_page='plots')


@app.route('/plots/<plot_id>/edit')
def plot_edit(plot_id):
    plot = models.get_plot_for_admin(plot_id)
    gardens = models.get_gardens()
    return render_template('plot_form.html', plot=plot, gardens=gardens, active_page='plots')


@app.route('/plots/create', methods=['POST'])
def plot_create():
    data = {
        'id': request.form.get('id', f'plot-{uuid.uuid4().hex[:8]}'),
        'title': request.form.get('title'),
        'subTitle': request.form.get('sub_title', ''),
        'location': request.form.get('location', ''),
        'area': float(request.form.get('area', 0)),
        'soilType': request.form.get('soil_type', ''),
        'lightCondition': request.form.get('light_condition', ''),
        'waterPrice': float(request.form.get('water_price', 0)),
        'annualRent': float(request.form.get('annual_rent', 0)),
        'description': request.form.get('description', ''),
        'owner': {
            'name': request.form.get('owner_name', ''),
            'phone': request.form.get('owner_phone', ''),
            'avatar': request.form.get('owner_avatar', '')
        },
        'images': request.form.get('images', '').split(',') if request.form.get('images') else [],
        'tags': request.form.get('tags', '').split(',') if request.form.get('tags') else [],
        'status': request.form.get('status', 'available'),
        'gardenId': request.form.get('garden_id')
    }
    models.create_plot(data)
    return redirect(url_for('plots_list'))


@app.route('/plots/<plot_id>/update', methods=['POST'])
def plot_update(plot_id):
    data = {
        'title': request.form.get('title'),
        'subTitle': request.form.get('sub_title', ''),
        'location': request.form.get('location', ''),
        'area': float(request.form.get('area', 0)),
        'soilType': request.form.get('soil_type', ''),
        'lightCondition': request.form.get('light_condition', ''),
        'waterPrice': float(request.form.get('water_price', 0)),
        'annualRent': float(request.form.get('annual_rent', 0)),
        'description': request.form.get('description', ''),
        'owner': {
            'name': request.form.get('owner_name', ''),
            'phone': request.form.get('owner_phone', ''),
            'avatar': request.form.get('owner_avatar', '')
        },
        'images': request.form.get('images', '').split(',') if request.form.get('images') else [],
        'tags': request.form.get('tags', '').split(',') if request.form.get('tags') else [],
        'status': request.form.get('status', 'available'),
        'gardenId': request.form.get('garden_id')
    }
    models.update_plot(plot_id, data)
    return redirect(url_for('plots_list'))


@app.route('/plots/<plot_id>/delete')
def plot_delete(plot_id):
    models.delete_plot(plot_id)
    return redirect(url_for('plots_list'))


@app.route('/gardens')
def gardens_list():
    gardens = models.get_gardens()
    # 添加地块计数
    for g in gardens:
        plots = models.get_plots_by_garden(g['id'])
        g['plot_count'] = len(plots)
    return render_template('gardens.html', gardens=gardens, active_page='gardens')


@app.route('/gardens/new')
def garden_new():
    garden = {}
    regions = models.get_regions()
    return render_template('garden_form.html', garden=garden, regions=regions, active_page='gardens')


@app.route('/gardens/<garden_id>/edit')
def garden_edit(garden_id):
    garden = models.get_garden_by_id(garden_id)
    regions = models.get_regions()
    return render_template('garden_form.html', garden=garden, regions=regions, active_page='gardens')


@app.route('/gardens/create', methods=['POST'])
def garden_create():
    data = {
        'id': request.form.get('id', f'gc-{uuid.uuid4().hex[:8]}'),
        'name': request.form.get('name'),
        'address': request.form.get('address'),
        'coordinates': {
            'lat': float(request.form.get('lat', 0)),
            'lng': float(request.form.get('lng', 0))
        },
        'description': request.form.get('description', ''),
        'thumb': request.form.get('thumb', ''),
        'regionId': request.form.get('region_id')
    }
    models.create_garden(data)
    return redirect(url_for('gardens_list'))


@app.route('/gardens/<garden_id>/update', methods=['POST'])
def garden_update(garden_id):
    data = {
        'name': request.form.get('name'),
        'address': request.form.get('address'),
        'coordinates': {
            'lat': float(request.form.get('lat', 0)),
            'lng': float(request.form.get('lng', 0))
        },
        'description': request.form.get('description', ''),
        'thumb': request.form.get('thumb', ''),
        'regionId': request.form.get('region_id')
    }
    models.update_garden(garden_id, data)
    return redirect(url_for('gardens_list'))


@app.route('/gardens/<garden_id>/delete')
def garden_delete(garden_id):
    models.delete_garden(garden_id)
    return redirect(url_for('gardens_list'))


@app.route('/regions')
def regions_list():
    regions = models.get_regions()
    # 添加父区域名称和园区计数
    region_dict = {r['id']: r['name'] for r in regions}
    for r in regions:
        r['parent_name'] = region_dict.get(r['parent_id'], '')
        gardens = models.get_gardens()
        r['garden_count'] = len([g for g in gardens if g['region_id'] == r['id']])
    return render_template('regions.html', regions=regions, active_page='regions')


# ========== API接口 ==========

# 区域数据
@app.route('/api/regions', methods=['GET'])
def api_regions():
    tree = models.get_region_tree()
    return json.dumps(tree, ensure_ascii=False)


# 园区数据
@app.route('/api/gardens', methods=['GET'])
def api_gardens():
    gardens = models.get_gardens()
    return json.dumps(gardens, ensure_ascii=False)


@app.route('/api/gardens/<garden_id>', methods=['GET'])
def api_garden(garden_id):
    garden = models.get_garden_by_id(garden_id)
    if garden:
        return json.dumps(garden, ensure_ascii=False)
    return json.dumps({'error': '园区不存在'}), 404


# 地块数据
@app.route('/api/plots', methods=['GET'])
def api_plots():
    garden_id = request.args.get('garden_id')
    owner_phone = request.args.get('owner_phone')

    if owner_phone:
        # 查询指定业主的地块
        plots = models.get_plots()
        plots = [p for p in plots if p.get('owner', {}).get('phone') == owner_phone]
    elif garden_id:
        plots = models.get_plots_by_garden(garden_id)
    else:
        plots = models.get_plots()

    return json.dumps(plots, ensure_ascii=False)


@app.route('/api/plots/<plot_id>', methods=['GET'])
def api_plot(plot_id):
    plot = models.get_plot_by_id(plot_id)
    if plot:
        return json.dumps(plot, ensure_ascii=False)
    return json.dumps({'error': '地块不存在'}), 404


@app.route('/api/plots/<plot_id>', methods=['PUT'])
def api_plot_update(plot_id):
    data = request.get_json()
    plot = models.update_plot(plot_id, data)
    if plot:
        return json.dumps(plot, ensure_ascii=False)
    return json.dumps({'error': '地块不存在'}), 404


# 统计数据
@app.route('/api/stats', methods=['GET'])
def api_stats():
    stats = models.get_stats()
    return json.dumps(stats, ensure_ascii=False)


# ========== 用户认证API ==========

@app.route('/api/auth/check', methods=['GET'])
def api_auth_check():
    phone = request.args.get('phone')
    if not phone:
        return json.dumps({'error': '缺少手机号'}), 400

    result = models.check_user_exists(phone)
    return json.dumps(result, ensure_ascii=False)


@app.route('/api/auth/login', methods=['POST'])
def api_auth_login():
    data = request.get_json()
    phone = data.get('phone')
    password = data.get('password')

    if not phone or not password:
        return json.dumps({'message': '请输入手机号和密码'}), 400

    # 查找用户
    user = models.get_user_by_phone(phone)

    if not user:
        return json.dumps({'message': '用户不存在'}), 401

    if user['password'] != password:
        return json.dumps({'message': '密码错误'}), 401

    return json.dumps({
        'id': user['id'],
        'phone': user['phone'],
        'name': user['name'],
        'avatar': user['avatar'],
        'isLandlord': user['is_landlord'] == 1
    }, ensure_ascii=False)


@app.route('/api/auth/register', methods=['POST'])
def api_auth_register():
    data = request.get_json()
    phone = data.get('phone')
    name = data.get('name')
    password = data.get('password')

    if not phone or not name or not password:
        return json.dumps({'message': '请填写完整信息'}), 400

    # 检查手机号是否已注册
    existing = models.get_user_by_phone(phone)
    if existing:
        return json.dumps({'message': '该手机号已注册'}), 400

    # 检查是否是地主
    landlord_check = models.check_user_exists(phone)
    is_landlord = landlord_check['isLandlord']

    # 创建用户
    user = models.create_user(phone, name, password, is_landlord)

    return json.dumps(user, ensure_ascii=False)


# ========== 消息API ==========

@app.route('/api/messages', methods=['GET'])
def api_messages_list():
    user_id = request.args.get('user_id')
    user_phone = request.args.get('user_phone')

    if not user_id:
        return json.dumps({'error': '缺少用户ID'}), 400

    # 查询消息，支持UUID和手机号
    messages = models.get_messages(user_id)

    # 如果提供了手机号，也用手机号查询（地主用户）
    if user_phone:
        additional_messages = models.get_messages(user_phone)
        # 合并消息，去重
        existing_ids = {m['id'] for m in messages}
        for msg in additional_messages:
            if msg['id'] not in existing_ids:
                messages.append(msg)

    # 按时间排序，并转换为camelCase格式
    messages.sort(key=lambda x: x['created_at'], reverse=True)

    # 转换字段名为camelCase
    formatted_messages = []
    for msg in messages:
        formatted_messages.append({
            'id': msg['id'],
            'senderId': msg['sender_id'],
            'senderPhone': msg['sender_phone'],
            'senderName': msg['sender_name'] or 'Unknown',
            'receiverId': msg['receiver_id'],
            'receiverName': msg['receiver_name'] or 'Unknown',
            'content': msg['content'],
            'createdAt': msg['created_at'],
            'read': msg['read']
        })

    return json.dumps(formatted_messages, ensure_ascii=False)


@app.route('/api/messages', methods=['POST'])
def api_messages_create():
    data = request.get_json()
    message = models.create_message(data)
    return json.dumps(message, ensure_ascii=False), 201


@app.route('/api/messages/<msg_id>/read', methods=['PUT'])
def api_messages_read(msg_id):
    models.mark_message_read(msg_id)
    return json.dumps({'message': '已标记为已读'}), 200


if __name__ == '__main__':
    models.init_db()
    models.seed_data()
    models.init_landlord_users()  # 初始化地主用户账号
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)