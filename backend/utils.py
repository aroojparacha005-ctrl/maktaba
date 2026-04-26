from datetime import date


def compute_progress(issue_date: date, due_date: date):
    """
    Returns (days_remaining, progress_pct, color_name) for a loan.
    Colors: green | yellow | orange | red
    """
    today = date.today()
    total = (due_date - issue_date).days
    elapsed = (today - issue_date).days
    days_remaining = (due_date - today).days

    if total <= 0:
        return days_remaining, 100, "red"

    pct = max(0, min(100, round((elapsed / total) * 100)))

    if today > due_date:
        color = "red"
        pct = 100
    elif pct < 33:
        color = "green"
    elif pct < 67:
        color = "yellow"
    else:
        color = "orange"

    return days_remaining, pct, color
