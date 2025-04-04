from flask import Flask, jsonify, request
import base64
from overallcg import visualize_filtered_cgpa
from percentile import compute_percentiles_and_visualize
from less import visualize_cgpa_distribution
from perf_degr import performance_degrade
from perf_impr import performance_improve
from comparison import comparison
from top_performers import top_performers
from semwisecg import visualize_semester_wise_trends
from flask_cors import CORS 
app = Flask(__name__)


CORS(app)
def encode_buffers(buffers):
    """Converts image buffers to Base64 strings."""
    encoded_images = []
    for buf in buffers:
        base64_str = base64.b64encode(buf.getvalue()).decode("utf-8")
        encoded_images.append(base64_str)
    return encoded_images


@app.route("/performance_degrade")
def perf_degrade():
    buffer = performance_degrade()
    return jsonify({'images': [buffer]})    

@app.route("/performance_improve")
def perf_improve():
    buffer = performance_improve()
    return jsonify({'images': [buffer]})

@app.route("/compare_gpas",methods=['POST',])
def compare_gpas():
    data = request.form

    roll_list = data.get('rollnos', '').split(',')
    buffer = comparison(roll_list)
    return jsonify({"images": [buffer]})

@app.route("/top_performers")
def top_perf():
    buffer = top_performers()
    return jsonify({'images': [buffer]}) 

@app.route("/overallcg")
def visualisefiltered_cgpa():
    buffers = visualize_filtered_cgpa()
    return jsonify({"images": encode_buffers(buffers)})

@app.route("/percentile")
def percentile1():
    buffers = compute_percentiles_and_visualize()
    return jsonify({"images": encode_buffers(buffers)})

@app.route("/less")
def less1():
    buffers = visualize_cgpa_distribution()
    return jsonify({"images": encode_buffers(buffers)})

@app.route("/semwisecg")
def sem():
    buffers = visualize_semester_wise_trends()

    return jsonify({"images": encode_buffers(buffers)})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
