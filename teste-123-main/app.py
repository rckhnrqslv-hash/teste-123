from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_mysqldb import MySQL
from werkzeug.security import generate_password_hash, check_password_hash
import os

app = Flask(__name__)
app.secret_key = 'bookshelf_secret_key'

# MODIFICAÇÃO NO SEU ARQUIVO PYTHON (app.py)
app.config['MYSQL_HOST'] = os.environ.get('MYSQL_HOST', 'localhost')
app.config['MYSQL_USER'] = os.environ.get('MYSQL_USER', 'root')
app.config['MYSQL_PASSWORD'] = os.environ.get('MYSQL_PASSWORD', 'escola')
app.config['MYSQL_DB'] = os.environ.get('MYSQL_DB', 'epub')
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'

mysql = MySQL(app)

@app.route('/')
def index():
    if 'usuario_id' in session:
        return redirect(url_for('perfil'))
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        # Adaptado: O formulário envia o campo 'email' no HTML, mas mapeamos para a coluna 'usuario'
        usuario_input = request.form.get('email') 
        senha = request.form.get('senha')
        
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM usuario WHERE usuario = %s", (usuario_input,))
        user = cursor.fetchone()
        cursor.close()
        
        if user and check_password_hash(user['senha_hash'], senha):
            # Salva o usuário na sessão do navegador
            session['usuario_id'] = user['id_usuario']
            session['username'] = user['usuario']
            return redirect(url_for('perfil'))
        else:
            flash("Usuário ou senha incorretos.", "error")
            
    return render_template('cadastro_login.html')

@app.route('/cadastro', methods=['GET', 'POST'])
def cadastro():
    if request.method == 'POST':
        nome = request.form.get('nome')
        email = request.form.get('email') # Usando o input do e-mail/username
        senha = request.form.get('senha')
        cpf = request.form.get('cpf')
        
        # Gera o hash seguro da senha antes de salvar
        senha_hash = generate_password_hash(senha)
        
        cursor = mysql.connection.cursor()
        
        # Verifica se o usuário ou CPF já existem
        cursor.execute("SELECT id_usuario FROM usuario WHERE usuario = %s OR cpf = %s", (email, cpf))
        existente = cursor.fetchone()
        
        if existente:
            flash("Nome de usuário ou CPF já cadastrado.", "error")
            cursor.close()
        else:
            # Insere o novo usuário no MySQL
            cursor.execute(
                "INSERT INTO usuario (usuario, senha_hash, cpf) VALUES (%s, %s, %s)",
                (email, senha_hash, cpf)
            )
            mysql.connection.commit()
            cursor.close()
            
            flash("Cadastro realizado com sucesso!", "success")
            return redirect(url_for('login'))
            
    return render_template('cadastro_login.html')

@app.route('/biblioteca')
def biblioteca():
    busca = request.args.get('q', '')
    cursor = mysql.connection.cursor()
    
    if busca:
        # Busca livros no MySQL filtrando por título ou autor
        query = "SELECT id_livro as id, titulo, autor, arquivo_epub as formato, 'Upload' as tamanho FROM livros WHERE titulo LIKE %s OR autor LIKE %s"
        cursor.execute(query, (f"%{busca}%", f"%{busca}%"))
    else:
        query = "SELECT id_livro as id, titulo, autor, arquivo_epub as formato, 'Upload' as tamanho FROM livros"
        cursor.execute(query)
        
    livros_filtrados = cursor.fetchall()
    cursor.close()
    
    return render_template('biblioteca.html', livros=livros_filtrados, busca=busca)

@app.route('/perfil')
def perfil():
    if 'usuario_id' not in session:
        flash("Por favor, faça o login primeiro.", "error")
        return redirect(url_for('login'))
        
    busca = request.args.get('q', '')
    id_usuario = session['usuario_id']
    
    cursor = mysql.connection.cursor()
    
    # Busca dados do usuário logado
    cursor.execute("SELECT usuario, cpf FROM usuario WHERE id_usuario = %s", (id_usuario,))
    db_user = cursor.fetchone()
    
    # Adapta para a estrutura de exibição do HTML antigo
    usuario_atual = {
        "nome": db_user['usuario'] if db_user else "Escritor",
        "username": db_user['usuario'] if db_user else "anonimo",
        "cpf": db_user['cpf'] if db_user else "",
        "bio": "Membro da comunidade Bookshelf conectado ao MySQL."
    }
    
    # Busca os livros que estão na biblioteca pessoal deste usuário
    if busca:
        query = """
            SELECT l.id_livro as id, l.titulo, l.autor, l.arquivo_epub as formato, bu.progresso 
            FROM biblioteca_usuario bu
            JOIN livros l ON bu.id_livro = l.id_livro
            WHERE bu.id_usuario = %s AND (l.titulo LIKE %s OR l.autor LIKE %s)
        """
        cursor.execute(query, (id_usuario, f"%{busca}%", f"%{busca}%"))
    else:
        query = """
            SELECT l.id_livro as id, l.titulo, l.autor, l.arquivo_epub as formato, bu.progresso 
            FROM biblioteca_usuario bu
            JOIN livros l ON bu.id_livro = l.id_livro
            WHERE bu.id_usuario = %s
        """
        cursor.execute(query, (id_usuario,))
        
    livros_prateleira = cursor.fetchall()
    cursor.close()

    # Rascunhos continuam estáticos pois não há tabela de rascunhos no script SQL fornecido
    rascunhos_estaticos = [
        {
            "id": 1,
            "titulo": "Crônicas de Bordeaux: O Início",
            "updated_at": "14/09/2026",
            "previa": "O sol se punha atrás das colinas avermelhadas..."
        }
    ]

    return render_template(
        'usuario.html', 
        usuario=usuario_atual, 
        livros_prateleira=livros_prateleira,
        rascunhos=rascunhos_estaticos,
        publicados=[],
        busca=busca
    )

@app.route('/perfil/publicar', methods=['POST'])
def publicar_livro():
    if 'usuario_id' not in session:
        return redirect(url_for('login'))
        
    titulo = request.form.get('titulo')
    arquivo = request.files.get('arquivo')
    
    if arquivo and arquivo.filename != '':
        extensao = os.path.splitext(arquivo.filename).replace('.', '')
        
        cursor = mysql.connection.cursor()
        
        # Insere o novo livro na tabela 'livros'
        # Passamos None para a capa e categoria que podem ser nulos/vazios por padrão temporariamente
        cursor.execute(
            "INSERT INTO livros (titulo, arquivo_epub, autor, id_categoria) VALUES (%s, %s, %s, %s)",
            (titulo, extensao.upper(), "Você (Autor Bookshelf)", None)
        )
        id_novo_livro = cursor.lastrowid
        
        # Adiciona automaticamente o livro publicado à biblioteca do próprio usuário logado
        cursor.execute(
            "INSERT INTO biblioteca_usuario (id_usuario, id_livro, progresso) VALUES (%s, %s, %s)",
            (session['usuario_id'], id_novo_livro, 100.00)
        )
        
        mysql.connection.commit()
        cursor.close()
        
        flash(f"Obra '{titulo}' cadastrada com sucesso no MySQL!", "success")
        return redirect(url_for('perfil'))
        
    flash("Erro ao enviar o arquivo do manuscrito.", "error")
    return redirect(url_for('perfil'))

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
