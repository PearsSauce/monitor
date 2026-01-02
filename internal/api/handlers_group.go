package api

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"monitor/internal/model"
)

// handleGroups handles GET/POST /api/groups
func (s *Server) handleGroups(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		s.listGroups(w, r)
	case http.MethodPost:
		s.createGroup(w, r)
	default:
		methodNotAllowed(w)
	}
}

func (s *Server) listGroups(w http.ResponseWriter, r *http.Request) {
	rows, err := s.svc.DB().Query(`SELECT id,name,icon,color FROM monitor_groups ORDER BY id`)
	if err != nil {
		databaseError(w, err)
		return
	}
	defer rows.Close()

	var list []model.MonitorGroup
	for rows.Next() {
		var g model.MonitorGroup
		if err := rows.Scan(&g.ID, &g.Name, &g.Icon, &g.Color); err != nil {
			databaseError(w, err)
			return
		}
		list = append(list, g)
	}
	if list == nil {
		list = []model.MonitorGroup{}
	}
	writeJSON(w, list)
}

func (s *Server) createGroup(w http.ResponseWriter, r *http.Request) {
	if !s.requireAuth(r) {
		unauthorized(w)
		return
	}

	var g model.MonitorGroup
	if err := json.NewDecoder(r.Body).Decode(&g); err != nil {
		badRequest(w, "无效的JSON格式")
		return
	}

	if strings.TrimSpace(g.Name) == "" {
		validationError(w, "分组名称不能为空", nil)
		return
	}

	id := nextID()
	_, err := s.svc.DB().Exec(`INSERT INTO monitor_groups(id,name,icon,color) VALUES($1,$2,$3,$4)`, id, g.Name, g.Icon, g.Color)
	if err != nil {
		databaseError(w, err)
		return
	}

	s.logger.Info("分组创建成功", "id", id, "name", g.Name)
	w.WriteHeader(http.StatusCreated)
	writeJSON(w, map[string]int64{"id": id})
}

// handleGroupByID handles PUT/DELETE /api/groups/{id}
func (s *Server) handleGroupByID(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/api/groups/")
	id, err := strconv.Atoi(path)
	if err != nil {
		badRequest(w, "无效的分组ID")
		return
	}

	switch r.Method {
	case http.MethodPut:
		s.updateGroup(w, r, id)
	case http.MethodDelete:
		s.deleteGroup(w, r, id)
	default:
		methodNotAllowed(w)
	}
}

func (s *Server) updateGroup(w http.ResponseWriter, r *http.Request, id int) {
	if !s.requireAuth(r) {
		unauthorized(w)
		return
	}

	var g model.MonitorGroup
	if err := json.NewDecoder(r.Body).Decode(&g); err != nil {
		badRequest(w, "无效的JSON格式")
		return
	}

	_, err := s.svc.DB().Exec(`UPDATE monitor_groups SET name=$1, icon=$2, color=$3 WHERE id=$4`, g.Name, g.Icon, g.Color, id)
	if err != nil {
		databaseError(w, err)
		return
	}

	s.logger.Info("分组更新成功", "id", id)
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) deleteGroup(w http.ResponseWriter, r *http.Request, id int) {
	if !s.requireAuth(r) {
		unauthorized(w)
		return
	}

	_, err := s.svc.DB().Exec(`DELETE FROM monitor_groups WHERE id=$1`, id)
	if err != nil {
		databaseError(w, err)
		return
	}

	s.logger.Info("分组删除成功", "id", id)
	w.WriteHeader(http.StatusNoContent)
}
