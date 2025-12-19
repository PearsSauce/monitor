BINARY=monitor-server
PKG=./cmd/server
BUILD_DIR=build
LDFLAGS=-s -w
ENV=CGO_ENABLED=0

.PHONY: build-linux-amd64 build-linux-arm64 build-all clean

build-linux-amd64:
	@mkdir -p $(BUILD_DIR)/linux-amd64
	$(ENV) GOOS=linux GOARCH=amd64 go build -trimpath -ldflags "$(LDFLAGS)" -o $(BUILD_DIR)/linux-amd64/$(BINARY) $(PKG)

build-linux-arm64:
	@mkdir -p $(BUILD_DIR)/linux-arm64
	$(ENV) GOOS=linux GOARCH=arm64 go build -trimpath -ldflags "$(LDFLAGS)" -o $(BUILD_DIR)/linux-arm64/$(BINARY) $(PKG)

build-all: build-linux-amd64 build-linux-arm64

clean:
	@rm -rf $(BUILD_DIR)
