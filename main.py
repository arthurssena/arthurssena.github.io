import js
import plotly
import plotly.express as px
import numpy as np
import pandas as pd

data = {'Year':['2020', '2021', '2022', '2023', '2024'], 'Citations':[25, 85, 162, 165, 63] }
df = pd.DataFrame(data)

total_citations = np.sum(data['Citations'])
fig = px.bar(df, x='Year', y='Citations', color = 'Citations', 
        color_continuous_scale = [(0,'#7fffd2'), (0.5, '#00d5ff'), (1,'#008cff')],
        text_auto = False, template="plotly_white", height=290)

fig.update_coloraxes(showscale=False)
fig.update_layout(margin=dict(l=20, r=20, t=80, b=20), title_x=0.5, showlegend=False, font_color="#6d8996", title_font_color='#00abf0',
                        title_text ="<b>Total = {} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span style='color:#6d8996'>h-index = 11</span>".format(total_citations))

fig.update_yaxes(showgrid=True, gridwidth=.5, gridcolor='#d9e8f4')

fig.update_traces(textposition="outside", cliponaxis=False, marker_line_width = 0, selector=dict(type="bar"))

fig.update_layout({
'plot_bgcolor': 'rgba(0, 0, 0, 0)',
'paper_bgcolor': 'rgba(0, 0, 0, 0)',
'xaxis': {'title': '',
                'visible': True,
                'showticklabels': True},
        'yaxis': {'title': '',
                'visible': True,
                'showticklabels': True},
})


js.plot(fig.to_json(), "citationsChart")