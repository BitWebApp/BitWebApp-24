from io import BytesIO
import matplotlib.pyplot as plt

def make_buffer(fig) :
    buf = BytesIO()
    fig.savefig(buf, format="png")
    buf.seek(0)
   
    plt.close(fig)  
    return buf