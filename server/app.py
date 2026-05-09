import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import models

load_dotenv()

app = Flask(__name__)
CORS(app)


@app.route('/')
def index():
    return jsonify({'message': '城市菜地 API 服务运行中'})


@app.route('/api/regions', methods=['GET'])
def get_regions():
    tree = models.get_region_tree()
    return jsonify(tree)


@app.route('/api/gardens', methods=['GET'])
def get_gardens():
    gardens = models.get_gardens()
    return jsonify(gardens)


@app.route('/api/gardens/<garden_id>', methods=['GET'])
def get_garden(garden_id):
    garden = models.get_garden_by_id(garden_id)
    if garden:
        return jsonify(garden)
    return jsonify({'error': '园区不存在'}), 404


@app.route('/api/gardens', methods=['POST'])
def create_garden():
    data = request.get_json()
    garden = models.create_garden(data)
    return jsonify(garden), 201


@app.route('/api/gardens/<garden_id>', methods=['PUT'])
def update_garden(garden_id):
    data = request.get_json()
    garden = models.update_garden(garden_id, data)
    if garden:
        return jsonify(garden)
    return jsonify({'error': '园区不存在'}), 404


@app.route('/api/gardens/<garden_id>', methods=['DELETE'])
def delete_garden(garden_id):
    models.delete_garden(garden_id)
    return jsonify({'message': '删除成功'}), 200


@app.route('/api/plots', methods=['GET'])
def get_plots():
    garden_id = request.args.get('garden_id')
    if garden_id:
        plots = models.get_plots_by_garden(garden_id)
    else:
        plots = models.get_plots()
    return jsonify(plots)


@app.route('/api/plots/<plot_id>', methods=['GET'])
def get_plot(plot_id):
    plot = models.get_plot_by_id(plot_id)
    if plot:
        return jsonify(plot)
    return jsonify({'error': '地块不存在'}), 404


@app.route('/api/plots', methods=['POST'])
def create_plot():
    data = request.get_json()
    plot = models.create_plot(data)
    return jsonify(plot), 201


@app.route('/api/plots/<plot_id>', methods=['PUT'])
def update_plot(plot_id):
    data = request.get_json()
    plot = models.update_plot(plot_id, data)
    if plot:
        return jsonify(plot)
    return jsonify({'error': '地块不存在'}), 404


@app.route('/api/plots/<plot_id>', methods=['DELETE'])
def delete_plot(plot_id):
    models.delete_plot(plot_id)
    return jsonify({'message': '删除成功'}), 200


@app.route('/api/stats', methods=['GET'])
def get_stats():
    stats = models.get_stats()
    return jsonify(stats)


if __name__ == '__main__':
    models.init_db()
    models.seed_data()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)