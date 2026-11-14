# Implementação da trilha A2

## Entregue no sistema

A rota `/#/a2` apresenta 12 unidades com 36 situações: uma para estudar, outra para verificar o aprendizado e uma terceira para revisão posterior. Cada situação tem oito atividades: dois documentos, duas atividades de escuta, escrita livre, produção oral, interação em três turnos e mediação. São 288 atividades, incluindo 288 perguntas objetivas de compreensão distribuídas entre as atividades de leitura e escuta.

O conteúdo é uma primeira versão autoral, identificada como rascunho pedagógico. A presença de uma atividade não significa que sua dificuldade tenha sido validada como A2.

Unidades: transporte, contatos, compromissos, moradia, compras, restaurante, saúde, trabalho, estudos, experiências passadas, serviços e situações combinadas. A interface recomenda a próxima atividade e prioriza revisões novas quando chega o momento, além de encaminhar erros de compreensão para prática de apoio.

## Aprendizagem e evidências

O site mantém as respostas, os rascunhos, os áudios referenciados, as autoavaliações, os apoios consultados e a origem das avaliações. O aluno pode navegar livremente, e seus rascunhos são recuperados quando volta à atividade.

Leitura e escuta usam perguntas sobre o conteúdo, com feedback objetivo. Escrita, fala, interação e mediação aceitam respostas próprias; não recebem uma nota automática de correção por comparação literal. O aluno preenche uma autoavaliação explícita com quatro critérios.

Os estados por habilidade são:

1. Ainda não praticado.
2. Praticado, ainda sem demonstração.
3. Demonstrado em situação nova.
4. Confirmado em revisão posterior.

Os critérios internos exigem duas fontes de compreensão por situação, ou revisão manual positiva para uma resposta aberta. A confirmação posterior depende de material de revisão, de outra sessão e de pelo menos 24 horas. Consultar transcrição, ajuda, modelo, desacelerar áudio ou refazer uma tarefa após feedback mantém aquela tentativa como prática assistida. O reconhecimento automático de fala não atribui mais acerto de pronúncia no módulo antigo.

Essas regras são conservadoras e não substituem uma avaliação profissional. Se uma situação de verificação já foi exposta com ajuda ou gabarito, a repetição não se torna uma nova demonstração independente. Ampliar o banco de variantes após o piloto será importante para permitir mais oportunidades de avaliação com material novo.

## Fluxo do professor

1. O aluno abre **Trilha A2 → Portfólio** e exporta respostas e gravações.
2. O professor abre **Área de revisão manual** e carrega esse arquivo.
3. Pode consultar a tarefa, ouvir os áudios e a resposta do aluno, atribuir notas de 0 a 3 e escrever feedback.
4. Exporta somente as avaliações completas e devolve o arquivo ao aluno pelo canal escolhido entre eles.
5. O aluno importa o arquivo no portfólio. As avaliações só se aplicam às tentativas com identificadores correspondentes.

O site não envia mensagens nem arquivos ao professor automaticamente. O nome do avaliador é informado no arquivo, sem verificação de identidade. As notas são registros pedagógicos locais, sem certificação.

## Áudio e gravações

Os 180 arquivos M4A incluem 72 materiais de escuta e 108 falas de interlocutor. São áudios sintéticos locais com as vozes Xander (`nl-NL`) e Ellen (`nl-BE`). Os scripts, as vozes, a duração e o hash da geração ficam no manifesto. O estado de revisão linguística está explicitamente pendente.

Os arquivos do curso não dependem de uma voz disponível no navegador do aluno. O TTS já existente continua disponível nos demais exercícios. Pacotes de áudio por unidade podem ser guardados no cache da PWA; requisições de intervalo de bytes são tratadas para reprodução offline. A versão do cache de áudio acompanha o manifesto gerado.

Respostas gravadas ficam no IndexedDB do dispositivo. O aluno pode ouvir, baixar, excluir ou exportar seus arquivos. Se o microfone não estiver disponível, pode enviar um arquivo de áudio. Uma alternativa digitada para tarefa oral fica identificada como prática escrita; não comprova habilidade oral.

O backup comum em Settings mantém o progresso e referências, mas não os arquivos de áudio. Para transferir gravações a outro navegador, usar o portfólio A2 completo. O reset do sistema também limpa o armazenamento de gravações antes de apagar o progresso.

## Validação técnica realizada

A suíte inclui verificação de cobertura dos materiais e ativos de áudio; hashes dos roteiros; migração e persistência; regras de evidência e retenção; exportação/importação dos bytes de gravações; ciclo de abertura e encerramento do microfone; navegação, rascunhos e respostas em testes de interface; revisão manual do professor e importação das notas; cache de áudio e intervalos de bytes.

O navegador integrado estava indisponível nesta sessão. Os testes de interface usam DOM simulado, e não constituem conferência visual, teste acústico ou verificação em aparelhos reais.

## Pendências externas antes de apresentar a trilha como preparação validada

- Revisão linguística de textos, exemplos e arquivos de áudio por falante competente de holandês.
- Revisão da dificuldade e das rubricas por professor familiarizado com o QECR.
- Teste da unidade piloto com alunos e observação de dificuldades e respostas válidas.
- Conferência em dispositivos e navegadores reais, especialmente permissões de microfone, áudio e comportamento offline.
- Calibração das avaliações abertas e expansão das variantes para novas oportunidades de verificação.

As unidades estão disponíveis para uso e revisão, com esses limites visíveis. O sistema não declara que concluir a trilha atribui nível A2.
