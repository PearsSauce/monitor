package domain

import "time"

func NormalizeTrafficResetDay(day int) int {
	if day < 1 {
		return 1
	}
	if day > 31 {
		return 31
	}
	return day
}

func TrafficPeriod(now time.Time, resetDay int) (time.Time, time.Time) {
	resetDay = NormalizeTrafficResetDay(resetDay)
	current := resetTime(now.Year(), now.Month(), resetDay, now.Location())
	if now.Before(current) {
		prev := now.AddDate(0, -1, 0)
		return resetTime(prev.Year(), prev.Month(), resetDay, now.Location()), current
	}
	next := now.AddDate(0, 1, 0)
	return current, resetTime(next.Year(), next.Month(), resetDay, now.Location())
}

func NextTrafficReset(now time.Time, resetDay int) time.Time {
	_, next := TrafficPeriod(now, resetDay)
	return next
}

func resetTime(year int, month time.Month, day int, loc *time.Location) time.Time {
	day = NormalizeTrafficResetDay(day)
	lastDay := daysInMonth(year, month, loc)
	if day > lastDay {
		day = lastDay
	}
	return time.Date(year, month, day, 0, 0, 0, 0, loc)
}

func daysInMonth(year int, month time.Month, loc *time.Location) int {
	return time.Date(year, month+1, 0, 0, 0, 0, 0, loc).Day()
}
