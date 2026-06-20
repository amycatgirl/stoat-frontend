{
	inputs = {
		nixpkgs.url = "github:nixos/nixpkgs/986f1b4a038e89d9153bc21394d19a77830b450d";
	};

	outputs = { self, nixpkgs }: let
		system = "x86_64-linux";
		pkgs = nixpkgs.legacyPackages.${system};
		nix-ld-libs = pkgs.buildEnv {
			name = "nix-ld-libs";
			paths = with pkgs; [
				stdenv.cc.cc.lib
				zlib
				openssl
			];
		};
	in {
		devShells.${system}.default = pkgs.mkShell {
			packages = with pkgs; [
    			mise
    			cargo-binstall
    			(writeShellScriptBin "fish" ''
      				exec ${pkgs.fish}/bin/fish -C 'mise activate fish | source' "$@"
    			'')
  			];

  			shellHook = ''
    			export NIX_LD="${pkgs.stdenv.cc.libc}/lib/ld-linux-x86-64.so.2"
    			export NIX_LD_LIBRARY_PATH="${nix-ld-libs}/lib"

    			export MISE_NODE_COMPILE=false
    			eval "$(mise activate bash)"

    			export PLAYWRIGHT_BROWSERS_PATH=${pkgs.playwright-driver.browsers}
    			export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=true

    			playwrightNpmVersion="$(npm show @playwright/test version)"
    			echo "❄️ Playwright nix version: ${pkgs.playwright.version}"
    			echo "📦 Playwright npm version: $playwrightNpmVersion"

    			if [ "${pkgs.playwright.version}" != "$playwrightNpmVersion" ]; then
    			  echo "❌ Playwright versions in nix and npm are not the same!"
    			else
    			  echo "✅ Playwright versions in nix and npm are the same"
    			fi
  			'';
		};
	};
}
