from get_data import get_academic_data
from numpy import corrcoef 

def performance_degrade():
    # columns = ["Roll No", "Name", "branch", "section","sem1","sem2", "sem3",
    #            "sem4","sem5","sem6","sem7","sem8"]
    record_dict = get_academic_data()
    sems = ["sem1","sem2", "sem3","sem4","sem5","sem6","sem7","sem8"]
    corr = []
    for rollno in record_dict:
        x,gpas = [],[]
        for sem in sems:
            k = record_dict[rollno].get(sem,-1)
            if(k==-1):
                continue
            x.append(int(sem[-1]))
            gpas.append(k)
        if(len(x)==1 or len(gpas)==1):
            continue
        if(len(set(gpas))==1):
            continue
        r = corrcoef(x,gpas)[0][1]

        corr.append([r,rollno])

    corr = [ele for ele in corr if ele[0]<0]
    corr = sorted(corr)
    print(corr)
    for ele in corr:
        print(record_dict[ele[1]])
    
    return corr

