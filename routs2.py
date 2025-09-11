from flask import Flask, render_template, jsonify, request
import numpy as np
import math
import random

app = Flask(__name__)

# 主页路由
@app.route('/')
def index():
    return render_template('index.html')

# 生成正态分布数据
@app.route('/api/normal-distribution', methods=['GET'])
def normal_distribution():
    mean = float(request.args.get('mean', 0))
    std = float(request.args.get('std', 1))
    size = int(request.args.get('size', 1000))
    
    # 生成正态分布数据
    data = np.random.normal(loc=mean, scale=std, size=size).tolist()
    
    return jsonify({
        'mean': mean,
        'std': std,
        'data': data
    })

# 生成二项分布数据
@app.route('/api/binomial-distribution', methods=['GET'])
def binomial_distribution():
    n = int(request.args.get('n', 10))
    p = float(request.args.get('p', 0.5))
    size = int(request.args.get('size', 1000))
    
    # 生成二项分布数据
    data = np.random.binomial(n=n, p=p, size=size).tolist()
    
    return jsonify({
        'n': n,
        'p': p,
        'data': data
    })

# 生成泊松分布数据
@app.route('/api/poisson-distribution', methods=['GET'])
def poisson_distribution():
    lam = float(request.args.get('lambda', 3))
    size = int(request.args.get('size', 1000))
    
    # 生成泊松分布数据
    data = np.random.poisson(lam=lam, size=size).tolist()
    
    return jsonify({
        'lambda': lam,
        'data': data
    })

# 蒙特卡洛方法计算π
@app.route('/api/monte-carlo-pi', methods=['GET'])
def monte_carlo_pi():
    samples = int(request.args.get('samples', 10000))
    
    inside = 0
    points = []
    
    for _ in range(samples):
        x = random.random()
        y = random.random()
        distance = x**2 + y**2
        
        if distance <= 1:
            inside += 1
            points.append({'x': x, 'y': y, 'inside': True})
        else:
            points.append({'x': x, 'y': y, 'inside': False})
    
    pi_estimate = (inside / samples) * 4
    pi_exact = math.pi
    error = abs((pi_estimate - pi_exact) / pi_exact) * 100
    
    return jsonify({
        'samples': samples,
        'inside': inside,
        'pi_estimate': pi_estimate,
        'pi_exact': pi_exact,
        'error': error,
        # 为了性能，只返回部分点
        'points': points[:1000]
    })

# 生成相关数据
@app.route('/api/correlated-data', methods=['GET'])
def correlated_data():
    r = float(request.args.get('r', 0.8))
    size = int(request.args.get('size', 200))
    
    # 生成具有指定相关系数的数据
    x = np.random.normal(0, 1, size)
    y = r * x + np.random.normal(0, math.sqrt(1 - r**2), size)
    
    # 标准化并缩放数据
    x = ((x - np.mean(x)) / np.std(x) * 10 + 50).tolist()
    y = ((y - np.mean(y)) / np.std(y) * 10 + 50).tolist()
    
    data = [{'x': x[i], 'y': y[i]} for i in range(size)]
    
    return jsonify({
        'correlation': r,
        'data': data
    })

if __name__ == '__main__':
    app.run(debug=True)
