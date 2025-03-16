from flask import Flask
from perf_degr import performance_degrade
from perf_impr import performance_improve
app = Flask(__name__)


@app.route("/performance_degrade")
def perf_degrade():
    stud_list = performance_degrade()
    return stud_list

@app.route("/performance_improve")
def perf_improve():
    stud_list = performance_improve()
    return stud_list



