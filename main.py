import js
import plotly
import plotly.express as px
import numpy as np
import pandas as pd

data = {'Year':['2020', '2021', '2022', '2023', '2024'], 'Citations':[28, 85, 162, 160, 7] }
df = pd.DataFrame(data)


fig = px.bar(df, x='Year', y='Citations', color = 'Citations', color_continuous_scale = [(0,'#7fffd2'), (0.5, '#00d5ff'), (1,'#008cff')], text_auto = True, template="plotly_white", height=280)

fig.update_coloraxes(showscale=False)
fig.update_layout(margin=dict(l=20, r=20, t=40, b=20), showlegend=False, font_color="#6d8996")

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