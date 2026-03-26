.PHONY: run install requirements clean lint format

# Variáveis (Assumindo ambiente Windows com ambiente virtual em .\venv)
PYTHON = .\venv\Scripts\python
PIP = .\venv\Scripts\pip

# Comando principal para rodar o servidor de testes
run:
	$(PYTHON) run.py

# Instala todas as dependencias do requirements.txt
install:
	$(PIP) install -r requirements.txt

# Atualiza / Gera um novo requirements.txt
requirements:
	$(PIP) freeze > requirements.txt

# Executa testes (quando criados)
test:
	$(PYTHON) -m pytest -v --cov=. --cov-report=term-missing

# Limpa o cache do Python
clean:
	@echo "Limpando arquivos de cache temporários do Python..."
	-del /S /Q *.pyc
	-for /d /r . %%d in (__pycache__) do @if exist "%%d" rd /s /q "%%d"

# Executa o linter e analisador estático (Ruff)
lint:
	$(PYTHON) -m ruff check .

# Formata o código (Ruff)
format:
	$(PYTHON) -m ruff format .

# Executa teste de carga com Locust
loadtest:
	$(PYTHON) -m locust -f tests/locustfile.py --headless -u 50 -r 5 -t 60s --host http://localhost:8000 --csv=loadtest_results
