package domain

import (
	"testing"
	"time"
)

func TestNormalizeTrafficResetDay(t *testing.T) {
	tests := []struct {
		name string
		day  int
		want int
	}{
		{name: "below range", day: 0, want: 1},
		{name: "inside range", day: 15, want: 15},
		{name: "above range", day: 32, want: 31},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := NormalizeTrafficResetDay(tt.day); got != tt.want {
				t.Fatalf("NormalizeTrafficResetDay(%d) = %d, want %d", tt.day, got, tt.want)
			}
		})
	}
}

func TestTrafficPeriod(t *testing.T) {
	loc := time.FixedZone("test", 8*60*60)
	tests := []struct {
		name      string
		now       time.Time
		resetDay  int
		wantStart time.Time
		wantNext  time.Time
	}{
		{
			name:      "before current month reset",
			now:       time.Date(2026, time.July, 10, 12, 0, 0, 0, loc),
			resetDay:  15,
			wantStart: time.Date(2026, time.June, 15, 0, 0, 0, 0, loc),
			wantNext:  time.Date(2026, time.July, 15, 0, 0, 0, 0, loc),
		},
		{
			name:      "after current month reset",
			now:       time.Date(2026, time.July, 20, 12, 0, 0, 0, loc),
			resetDay:  15,
			wantStart: time.Date(2026, time.July, 15, 0, 0, 0, 0, loc),
			wantNext:  time.Date(2026, time.August, 15, 0, 0, 0, 0, loc),
		},
		{
			name:      "clamps to last day in short month",
			now:       time.Date(2026, time.February, 28, 12, 0, 0, 0, loc),
			resetDay:  31,
			wantStart: time.Date(2026, time.February, 28, 0, 0, 0, 0, loc),
			wantNext:  time.Date(2026, time.March, 31, 0, 0, 0, 0, loc),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			start, next := TrafficPeriod(tt.now, tt.resetDay)
			if !start.Equal(tt.wantStart) || !next.Equal(tt.wantNext) {
				t.Fatalf("TrafficPeriod() = (%s, %s), want (%s, %s)", start, next, tt.wantStart, tt.wantNext)
			}
			if got := NextTrafficReset(tt.now, tt.resetDay); !got.Equal(tt.wantNext) {
				t.Fatalf("NextTrafficReset() = %s, want %s", got, tt.wantNext)
			}
		})
	}
}
