import uvicorn

if __name__ == "__main__":
    print("Iniciando Simulador Térmico API na porta 8000...")
    print("Acesse o Swagger UI em: http://127.0.0.1:8000/docs")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
