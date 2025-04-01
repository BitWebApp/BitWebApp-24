import matplotlib
matplotlib.use('Agg') 
from get_data import get_academic_data
import matplotlib.pyplot as plt
import numpy as np
import io
import base64

def bar_plot(ax, data, colors=None, total_width=0.8, single_width=1, legend=True):
    """Draws a bar plot with multiple bars per data point.

    Parameters
    ----------
    ax : matplotlib.pyplot.axis
        The axis we want to draw our plot on.

    data: dictionary
        A dictionary containing the data we want to plot. Keys are the names of the
        data, the items is a list of the values.

        Example:
        data = {
            "x":[1,2,3],
            "y":[1,2,3],
            "z":[1,2,3],
        }

    colors : array-like, optional
        A list of colors which are used for the bars. If None, the colors
        will be the standard matplotlib color cyle. (default: None)

    total_width : float, optional, default: 0.8
        The width of a bar group. 0.8 means that 80% of the x-axis is covered
        by bars and 20% will be spaces between the bars.

    single_width: float, optional, default: 1
        The relative width of a single bar within a group. 1 means the bars
        will touch eachother within a group, values less than 1 will make
        these bars thinner.

    legend: bool, optional, default: True
        If this is set to true, a legend will be added to the axis.
    """
    if colors is None:
        colors = plt.rcParams['axes.prop_cycle'].by_key()['color']

    n_bars = len(data)

    bar_width = total_width / n_bars

    # List containing handles, used for the legend
    bars = []

    for i, (name, values) in enumerate(data.items()):
        # offset 
        x_offset = (i - n_bars / 2) * bar_width + bar_width / 2

        # Draw a bar for every value of that type
        for x, y in enumerate(values):
            bar = ax.bar(x + x_offset, y, width=bar_width * single_width, color=colors[i % len(colors)])

        # Add a handle to the last drawn bar, which we'll need for the legend
        bars.append(bar[0])
    if legend:
        ax.legend(bars, data.keys())


def comparison(rollNos:list[str]):
    data = get_academic_data()
    stats = {}
    for rollno in rollNos:
        # d = {}
        stats[rollno] = []
        sems = ["sem1","sem2", "sem3","sem4","sem5","sem6","sem7","sem8"]
        gpas = []
        for sem in sems:
            k = data[rollno].get(sem,-1)
            if(k==-1):
                gpas.append(0)
                continue
            gpas.append(k)
        stats[rollno] = gpas
    
    buf = make_plot_buffer(stats)
    print(buf)
    return buf
    

def make_plot_buffer(data):
    sems = ["sem1","sem2", "sem3","sem4","sem5","sem6","sem7","sem8"]
    fig,ax = plt.subplots()
    bar_plot(ax,data)
    plt.yticks(np.arange(0,11,1))
    plt.xticks(range(len(sems)),sems)
    buf = io.BytesIO()
    plt.savefig(buf,format='png')
    buf.seek(0)
    img_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
    plt.close()
    return img_base64
    # plt.show()

        

# d = comparison(["BTECH/10798/22","BTECH/10427/22","BTECH/10058/22"])
# sems = ["sem1","sem2", "sem3","sem4","sem5","sem6","sem7","sem8"]
# fig,ax = plt.subplots()
# bar_plot(ax,d)
# plt.yticks(np.arange(0,11,1))
# plt.xticks(range(len(sems)),sems)
# plt.show()