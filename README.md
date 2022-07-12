# BackEnd

Projeto Final do 2ºano (PINT)

##### Objetivo

->Cria uma aplicação que gere os espaços, os utilizadores e as reservas dos varios centros da Softinsa

## Rotas

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

### Centros

#### Listar os centros

centros/list

#### Criar um centro

centros/add

Paramentros de entrada:

->Nome,Endereco,Hora_abertura,Hora_fecho,Telefone

Requesitos:
->Tudo em string
->Formato das horas = hh:mm
->Hora de fecho tem que ser maior que hora de abertura

#### Obter um centro

centros/get/:id

#### Editar um centro

centros/update/:id

Paramentros de entrada:

->Nome,Endereco,Hora_abertura,Hora_fecho,Telefone

Requesitos:
->Tudo em string
->Formato das horas = hh:mm
->Hora de fecho tem que ser maior que hora de abertura

#### Eliminar um centro

centros/delete/:id

#### Ativar um centro

centros/ativar/:id

#### Desativar um centro

centros/desativar/:id

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

### Salas

#### Listar as salas

salas/list

#### Criar uma sala

salas/add

Paramentros de entrada:

->Nome, Capacidade, Alocacao, TempoLimpeza, Centro

Requesitos:
->Tudo em string
->Capacidade > Alocacao 
->Capacidade > 0, Alocacao > 1 e Alocacao < 100
->Centro e o id do centro
->Formato do Tempo de limpeza = hh:mm 

#### Obter uma sala

salas/get/:id

#### Editar uma sala

salas/update/:id

Paramentros de entrada:

->Nome, Capacidade, Alocacao, TempoLimpeza, Centro, Estado, MotivoBloqueio

Requesitos:
->Tudo em string
->Capacidade > Alocacao ambos inteiros
->Capacidade > 0, Alocacao > 1 e Alocacao < 100
->Centro e o id do centro
->Formato do Tempo de limpeza = hh:mm 
->Estado e o id do estado
->Motivo de bloqueio nao pode ser '' se o estado for desativado

#### Eliminar uma sala

salas/delete/:id

#### Ativar uma sala

salas/ativar/:id

#### Desativar uma sala

salas/desativar/:id

Paramentros de entrada:

->Motivo

Requesitos:

->Motivo nao pode ser '' 

#### Obter QR Code de uma sala

salas/codigo/:id

#### Obter lista das salas de um centro

salas/centro/:id

#### Obter lista das reservas ativas de uma sala

salas/listativas/:id

--------------------------------------------------------------------------------------------------------------------------------------------

### Reservas

#### Listar as reservas

reservas/list

#### Criar uma reserva

reservas/add

Paramentros de entrada:

->NomeReserva, DataReserva, NumeroParticipantes, HoraInicio, HoraFim, Utilizador, Sala

Requesitos:
->Tudo em string
->NumeroParticipantes > 0 e inteiro 
->Formato da DataReserva = ano-mes-dia
->Formato das horas = hh:mm
->Sala e o id da sala
->Utilizador e o id do Utilizador


#### Obter uma reserva

reservas/get/:id

#### Editar uma reserva

reservas/update/:id

Paramentros de entrada:

->NomeReserva, DataReserva, NumeroParticipantes, HoraInicio, HoraFim, Utilizador, Sala

Requesitos:
->Tudo em string
->NumeroParticipantes > 0 e inteiro 
->Formato da DataReserva = ano-mes-dia
->Formato das horas = hh:mm
->Sala e o id da sala
->Utilizador e o id do Utilizador

#### Eliminar uma reserva

reservas/delete/:id

#### Ativar uma reserva

reservas/ativar/:id

#### Desativar uma reserva

reservas/desativar/:id

Paramentros de entrada:

->Motivo

Requesitos:

->Motivo nao pode ser '' 

#### Obter reservas passadas de um utilizador

reservas/reservaspassadas/:id

#### Listar reservas de um utilizador

reservas/todasreservas/:id

#### Listar Reservas futuras e ativas de um utilizador

reservas/reservasfuturas/:id

#### Adiar Reserva

reservas/adiar/:id

Paramentros de entrada:

->ValorHora

Requesitos:

->Formato das horas = hh:mm

#### Terminar Reserva

reservas/terminar/:id

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

### Utilizadores POR FAZER

#### Listar as Utilizadores

utilizadores/list

#### Criar um Utilizador

utilizadores/register

Paramentros de entrada:

->NomeReserva, DataReserva, NumeroParticipantes, HoraInicio, HoraFim, Utilizador, Sala

Requesitos:
->Tudo em string
->NumeroParticipantes > 0 e inteiro 
->Formato da DataReserva = ano-mes-dia
->Formato das horas = hh:mm
->Sala e o id da sala
->Utilizador e o id do Utilizador


#### Obter um Utilizador

utilizadores/get/:id

#### Editar um Utilizador (web)

utilizadores/update/:id

Paramentros de entrada:

->NomeReserva, DataReserva, NumeroParticipantes, HoraInicio, HoraFim, Utilizador, Sala

Requesitos:
->Tudo em string
->NumeroParticipantes > 0 e inteiro 
->Formato da DataReserva = ano-mes-dia
->Formato das horas = hh:mm
->Sala e o id da sala
->Utilizador e o id do Utilizador

#### Editar um Utilizador (Mobile)

utilizadores/updateMobile/:id

Paramentros de entrada:

->NomeReserva, DataReserva, NumeroParticipantes, HoraInicio, HoraFim, Utilizador, Sala

Requesitos:
->Tudo em string
->NumeroParticipantes > 0 e inteiro 
->Formato da DataReserva = ano-mes-dia
->Formato das horas = hh:mm
->Sala e o id da sala
->Utilizador e o id do Utilizador

#### Eliminar um Utilizador

utilizadores/delete/:id

#### Ativar um Utilizador

utilizadores/ativar/:id

#### Desativar um Utilizador

utilizadores/desativar/:id

Paramentros de entrada:

->Motivo

Requesitos:

->Motivo nao pode ser '' 


#### Obter centros de um Utilizador

utilizadores/pertence/:id

#### Atualizar a palavra passe de um Utilizador

utilizadores/editpasse/:id

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

### Inputs

#### Listar Estados

testdata/listEstados

#### Listar Cargos

testdata/listCargos

#### Listar Estados Limpezas

testdata/listEstadosLimpezas

#### Listar Tipos Gestores

testdata/listTiposGestores

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

### Login





