import os
from pathlib import Path
import argparse
import numpy as np
import matplotlib
import matplotlib.pyplot as plt


def setup_style():
    matplotlib.rcParams.update({
        "figure.figsize": (16, 9),
        "figure.dpi": 120,
        "savefig.dpi": 120,
        "font.size": 18,
        "font.family": "sans-serif",
        "font.sans-serif": ["Microsoft YaHei", "SimHei", "DejaVu Sans"],
        "mathtext.fontset": "cm",
        "axes.facecolor": "#0b1221",
        "figure.facecolor": "#0b1221",
        "text.color": "#e5e7eb",
        "axes.labelcolor": "#e5e7eb",
        "xtick.color": "#9ca3af",
        "ytick.color": "#9ca3af",
        "axes.edgecolor": "#374151",
        "grid.color": "#374151",
    })


def make_canvas():
    fig, ax = plt.subplots()
    ax.set_axis_off()
    return fig, ax


def save_svg(fig, out_path):
    out_path.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(out_path, format="svg", bbox_inches="tight")
    plt.close(fig)


# ---- Distributions & formulas ----
def gumbel_pdf(x, mu=15.0, beta=3.0):
    z = (x - mu) / beta
    return (1.0 / beta) * np.exp(-(z + np.exp(-z)))


def gumbel_cdf(x, mu=15.0, beta=3.0):
    z = (x - mu) / beta
    return np.exp(-np.exp(-z))


def gev_cdf(x, mu=15.0, sigma=3.0, xi=0.0):
    t = 1.0 + xi * (x - mu) / sigma
    valid = t > 0
    F = np.zeros_like(x)
    if abs(xi) < 1e-12:  # Gumbel limit
        F = np.exp(-np.exp(-(x - mu) / sigma))
    else:
        F[valid] = np.exp(-(t[valid]) ** (-1.0 / xi))
        F[~valid] = np.nan
    return F


def slide_1_title(out_dir):
    fig, ax = make_canvas()
    ax.text(0.5, 0.75, "实践应用", ha="center", va="center", fontsize=56, color="#00f3ff")
    ax.text(0.5, 0.60, "洪水频率分析与极值分布", ha="center", va="center", fontsize=46, weight="bold")

    ax.text(
        0.5,
        0.40,
        r"$\text{Gumbel (I型极值)}\;\; f(x)=\frac{1}{\beta}\exp(-(z+e^{-z})),\; z=\frac{x-\mu}{\beta}$",
        ha="center",
        va="center",
        fontsize=24,
        color="#93c5fd",
    )
    ax.text(
        0.5,
        0.30,
        r"$F(x)=\exp(-e^{-\frac{x-\mu}{\beta}})$",
        ha="center",
        va="center",
        fontsize=24,
        color="#93c5fd",
    )

    save_svg(fig, out_dir / "flood_slide_1.svg")


def slide_2_gumbel_pdf_cdf(out_dir):
    fig = plt.figure(figsize=(16, 9), facecolor="#0b1221")
    gs = fig.add_gridspec(2, 2)
    ax_title = fig.add_subplot(gs[0, :])
    ax_pdf = fig.add_subplot(gs[1, 0])
    ax_cdf = fig.add_subplot(gs[1, 1])

    ax_title.set_axis_off()
    ax_title.text(0.5, 0.6, "Gumbel 分布：PDF 与 CDF", ha="center", va="center", fontsize=40, color="#00f3ff")
    ax_title.text(
        0.5,
        0.2,
        r"$f(x)=\frac{1}{\beta}\exp(-(z+e^{-z})),\; F(x)=\exp(-e^{-z}),\; z=\frac{x-\mu}{\beta}$",
        ha="center",
        va="center",
        fontsize=22,
        color="#93c5fd",
    )

    x = np.linspace(5, 30, 500)
    pdf = gumbel_pdf(x)
    cdf = gumbel_cdf(x)

    for ax in (ax_pdf, ax_cdf):
        ax.set_facecolor("#0b1221")
        ax.grid(True, alpha=0.25)
        ax.spines["bottom"].set_color("#374151")
        ax.spines["left"].set_color("#374151")
        ax.tick_params(colors="#9ca3af")

    ax_pdf.plot(x, pdf, color="#22d3ee", lw=3, label="PDF")
    ax_pdf.set_title("概率密度函数", color="#a5b4fc")
    ax_pdf.legend(facecolor="#111827", edgecolor="#374151", labelcolor="#e5e7eb")

    ax_cdf.plot(x, cdf, color="#a78bfa", lw=3, label="CDF")
    ax_cdf.set_title("累积分布函数", color="#a5b4fc")
    ax_cdf.legend(facecolor="#111827", edgecolor="#374151", labelcolor="#e5e7eb")

    save_svg(fig, out_dir / "flood_slide_2.svg")


def slide_3_return_period(out_dir):
    fig, ax = make_canvas()
    ax.text(0.5, 0.80, "重现期与洪水位", ha="center", va="center", fontsize=42, color="#00f3ff")
    ax.text(
        0.5,
        0.62,
        r"$\text{重现期}\; T = \frac{1}{1 - F(x)}$",
        ha="center",
        va="center",
        fontsize=36,
        color="#93c5fd",
    )
    ax.text(
        0.5,
        0.44,
        r"$F_{\text{Gumbel}}(x)=\exp(-e^{-\frac{x-\mu}{\beta}})$",
        ha="center",
        va="center",
        fontsize=28,
        color="#a5b4fc",
    )
    ax.text(
        0.5,
        0.28,
        "工程意义：评估不同年一遇洪水位发生概率，指导设计与调度",
        ha="center",
        va="center",
        fontsize=22,
        color="#d1d5db",
    )
    save_svg(fig, out_dir / "flood_slide_3.svg")


def slide_4_gev(out_dir):
    fig = plt.figure(figsize=(16, 9), facecolor="#0b1221")
    gs = fig.add_gridspec(2, 2)
    ax_title = fig.add_subplot(gs[0, :])
    ax_plot = fig.add_subplot(gs[1, :])

    ax_title.set_axis_off()
    ax_title.text(0.5, 0.65, "广义极值分布（GEV）", ha="center", va="center", fontsize=40, color="#00f3ff")
    ax_title.text(
        0.5,
        0.30,
        r"$F(x)=\exp(-(1+\xi\frac{x-\mu}{\sigma})^{-1/\xi}),\; 1+\xi\frac{x-\mu}{\sigma}>0$",
        ha="center",
        va="center",
        fontsize=24,
        color="#93c5fd",
    )

    x = np.linspace(5, 30, 600)
    curves = [
        (gev_cdf(x, xi=-0.2), "\u03BE=-0.2 (Weibull型)", "#22d3ee"),
        (gumbel_cdf(x), "\u03BE=0 (Gumbel)", "#a78bfa"),
        (gev_cdf(x, xi=0.2), "\u03BE=0.2 (Fréchet型)", "#84cc16"),
    ]
    ax_plot.set_facecolor("#0b1221")
    ax_plot.grid(True, alpha=0.25)
    ax_plot.spines["bottom"].set_color("#374151")
    ax_plot.spines["left"].set_color("#374151")
    ax_plot.tick_params(colors="#9ca3af")

    for y, label, color in curves:
        ax_plot.plot(x, y, lw=3, color=color, label=label)

    ax_plot.set_title("不同形状参数的CDF对比", color="#a5b4fc")
    ax_plot.legend(facecolor="#111827", edgecolor="#374151", labelcolor="#e5e7eb")
    save_svg(fig, out_dir / "flood_slide_4.svg")


def slide_5_quantiles(out_dir):
    fig, ax = make_canvas()
    ax.text(0.5, 0.82, "设计洪水位（分位数）", ha="center", va="center", fontsize=40, color="#00f3ff")
    ax.text(
        0.5,
        0.64,
        r"$x_T^{\text{Gumbel}}=\mu-\beta\,\ln(-\ln(1-1/T))$",
        ha="center",
        va="center",
        fontsize=30,
        color="#93c5fd",
    )
    ax.text(
        0.5,
        0.48,
        r"$x_T^{\text{GEV}}=\mu+\frac{\sigma}{\xi}(( -\ln(1-1/T) )^{-\xi}-1)$",
        ha="center",
        va="center",
        fontsize=30,
        color="#93c5fd",
    )
    ax.text(
        0.5,
        0.30,
        "示例：20年一遇 (T=20) 的防洪设计参考水位",
        ha="center",
        va="center",
        fontsize=22,
        color="#d1d5db",
    )
    save_svg(fig, out_dir / "flood_slide_5.svg")


def slide_6_case(out_dir):
    fig, ax = make_canvas()
    ax.text(0.5, 0.82, "江西典型工程案例（示意）", ha="center", va="center", fontsize=40, color="#00f3ff")
    bullets = [
        "鄱阳湖流域洪水风险评估：极值分布拟合历史数据",
        "赣江流域防洪工程设计：按重现期确定设计水位",
        "水库调度优化：基于分布参数进行风险—收益权衡",
        "城市排水系统设计：暴雨强度与重现期分析",
    ]
    y = 0.65
    for b in bullets:
        ax.text(0.15, y, f"• {b}", ha="left", va="center", fontsize=24, color="#d1d5db")
        y -= 0.10
    ax.text(
        0.5,
        0.22,
        r"$\text{方法支撑：极值理论 (Gumbel/GEV)、重现期、分位数}$",
        ha="center",
        va="center",
        fontsize=24,
        color="#93c5fd",
    )
    save_svg(fig, out_dir / "flood_slide_6.svg")


def main():
    setup_style()
    parser = argparse.ArgumentParser(description="Generate flood analysis SVG slides")
    parser.add_argument(
        "--out",
        type=str,
        default=None,
        help="输出目录 (e.g., C:\\Users\\...\\static\\img)",
    )
    args = parser.parse_args()

    root = Path(__file__).resolve().parent.parent
    out_dir = Path(args.out) if args.out else (root / "static" / "img")

    slide_1_title(out_dir)
    slide_2_gumbel_pdf_cdf(out_dir)
    slide_3_return_period(out_dir)
    slide_4_gev(out_dir)
    slide_5_quantiles(out_dir)
    slide_6_case(out_dir)

    print("SVG slides generated in:", out_dir)


if __name__ == "__main__":
    main()